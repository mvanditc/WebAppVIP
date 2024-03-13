//Preface Start
//////////////////////////////////////////////////////
//  Backend Server Code for Web App VIP
//
//  Table of Contents:
//   -
//////////////////////////////////////////////////////
//Preface End

//Backend Code Start
//////////////////////////////////////////////////////
// Requiring
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

// Data for Vulnerability Dictionary
let vulnerabilityDictionary = {}
fs.readFile("db/vulnerabilityDictionaryData.json", 'utf8', (err, data) => {
  if (err) {
      console.error('Error reading the file:', err);
      return;
  }

  try {
      // Parse the JSON data
      vulnerabilityDictionary = JSON.parse(data);

      // Now you can work with the parsed JSON data
      console.log('Vulnerability Dictionary Data has been Parsed');
  } catch (parseError) {
      console.error('Error parsing Vulnerability Dictionary Data JSON:', parseError);
  }
});

// API Key to use ZAP
const zapAPIKey = "ljhuthfiai88rg6t58ia539434"

// Client Usability Settings
const timeLimit = 8 // Time Limit in Seconds
const maxScanAmount = 3

var currentScanTime = 0

// Functional Variables
var queue = []

var isScanning = false
var queueCorrectionNeeded = false
var queueCorrectionCounting = false

var scanningTimerNeeded = false

var currentScanTargetURL = ""
var currentScanID = ""

var waitingForScanToFinish = false

var userCancelled = false

var checkingIfUserIsDisconnected = false

var historyOfScanRequests = {} //{scanID: {"hash": hashedData, "targeturl": "www.example.com", "statusOfProcess": status, "zapID": id}} is an example of 1 entry
const scanHistoryProcesses = ["false", "waiting", "done", "broken", "incomplete", "cancelled"]

let confidenceLevelReturnData = {};

// Initializing ExpressJS Application
const app = express();
const port = 3030;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(bodyParser.json());

// Defining ExpressJS Routes
app.get('/', (req, res) => {
  res.send("Backend service for Web App VIP is running...");
});

app.get('/get-vulnerability-dictionary-data', (req, res) => {
  res.json(vulnerabilityDictionary);
});

app.get('/get-current-scan-details', (req, res) => {
  res.json({
    "isScanning": isScanning,
    "currentScanTime": currentScanTime,
    "scanningTimerNeeded": scanningTimerNeeded,
    "queueCorrectionNeeded": queueCorrectionNeeded,
    "queueCorrectionCounting": queueCorrectionCounting,
    "waitingForScanToFinish": waitingForScanToFinish
  });
});

app.get('/view-scan-request-history', (req, res) => {
  res.json(historyOfScanRequests);
});

app.get('/view-queue', (req, res) => {
  res.send(queue);
});

app.put('/add-scan-to-queue', (req, res) => {
  console.log("/add-scan-to-queue")
  const ipAddress = req.ip;
  const host = req.hostname;
  console.log(ipAddress)
  console.log(host)

  const requestData = req.body;
  let scanTargetURL = requestData["url"];

  let currentTimestamp = Date.now()
  currentTimestamp = currentTimestamp.toString()

  let randomNumber1 = Math.floor(Math.random() * 255);
  let randomNumber2 = Math.floor(Math.random() * 255);
  let randomNumber3 = Math.floor(Math.random() * 255);
  let randomNumber4 = Math.floor(Math.random() * 255);

  let scanHash = applySHA256(currentTimestamp + randomNumber1 + randomNumber2 + randomNumber3 + randomNumber4)

  let hashForNewRequestHistoryEntry = {
    "hash": scanHash,
    "targetURL": scanTargetURL,
    "statusOfProcess": "false",
    "zapID": "-1"
  }

  try{
    // Logic for Entering Request Into Scan Request History
    if (historyOfScanRequests.hasOwnProperty(currentTimestamp)) {
      // This code finds a new index for the entry
      while (historyOfScanRequests.hasOwnProperty(currentTimestamp)){
        currentTimestamp = (Date.now()).toString()
      }
      historyOfScanRequests[currentTimestamp] = hashForNewRequestHistoryEntry;
      queue.push(currentTimestamp)
      res.json({
        "status": "success",
        "scanID": currentTimestamp,
        "hash": scanHash
      });
    }else {
      historyOfScanRequests[currentTimestamp] = hashForNewRequestHistoryEntry;
      queue.push(currentTimestamp)
      res.json({
        "status": "success",
        "scanID": currentTimestamp,
        "hash": scanHash
      });
    }
  }catch{
    res.json({ "status": "fail" });
  }

});

app.put('/remove-scan-from-queue', (req, res) => {
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try{
    if (queue.includes(targetScanID)){
      const scanIDScanPosition = (queue.indexOf(targetScanID)).toString();

      if (queueCorrectionCounting == true && scanIDScanPosition == "0"){
        queueCorrectionNeeded = false
      }

      if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash){
        queue.splice(scanIDScanPosition, 1);
        res.json({"status": "success"});
      }else{
        res.json({ "status": "invalid scan id" });
      }
    }else{
      res.json({ "status": "not found" });
    }
  }catch(error){
    console.error('An error occurred:', error.message);
    res.json({ "status": "fail" });
  }
});

app.get('/get-scan-queue-position', (req, res) => {
  let targetScanID = req.query.scanid;

  try{
    if (queueCorrectionCounting == false && isScanning == false){
      queueFlowCorrection()
    }

    const scanIDScanPosition = (queue.indexOf(targetScanID)).toString();

    if (scanIDScanPosition !== "-1") {
      res.json({
        "status": "success",
        "position": scanIDScanPosition,
        "isScanning": isScanning,
        "checkingIfUserIsDisconnected": checkingIfUserIsDisconnected
      });
    } else {
      console.log("scanId not found")
      if (queueCorrectionCounting == true && queue.length == 0){
        queueCorrectionNeeded = false
      }
      console.log(targetScanID)
      res.json({ "status": "fail" });
    }
  }catch(error){
    console.error('An error occurred:', error.message);
    res.json({ "status": "fail" });
  }
});

app.put('/process-queued-scan-if-next', (req, res) => {
  console.log("/process-queued-scan-if-next")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try{
    if (isScanning == false && checkingIfUserIsDisconnected == false){
      const scanIDScanPosition = (queue.indexOf(targetScanID)).toString();
      // If scan is next in queue and credentials match, then process request
      if (scanIDScanPosition == "0"){
        if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash){
          isScanning = true
          queue.shift();
          historyOfScanRequests[targetScanID]["statusOfProcess"] = "waiting"

          res.json({
            "status": "success"
          });
        }else{
          res.json({ "status": "invalid scan id" });
        }
      }else if(scanIDScanPosition == "-1"){
        res.json({ "status": "not found" });
      }else{
        res.json({ "status": "not ready" });
      }
    }else{
      res.json({ "status": "scan tool busy" });
    }
  }catch(error){
    console.error('An error occurred:', error.message);
    res.json({ "status": "fail" });
  }
});


app.put('/attempt-scan', async (req, res) => {
  console.log("/attempt-scan")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try {
    if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash && historyOfScanRequests[targetScanID]["statusOfProcess"] == "waiting"){
      const zapResponse = await initiateScan(historyOfScanRequests[targetScanID]["targetURL"]);
      if (zapResponse == null){
        res.json({ "status": "fail" });
      }else{
        historyOfScanRequests[targetScanID]["statusOfProcess"] = zapResponse.data.scan
        historyOfScanRequests[targetScanID]["zapID"] = zapResponse.data.scan

        scanningTimerNeeded = true
        startScanningTimer(targetScanID)
        queueCorrectionNeeded = false
        currentScanTargetURL = historyOfScanRequests[targetScanID]["targetURL"]

        currentScanID = targetScanID

        userCancelled = false

        res.json({
          "status": "success",
          "timeLimit": timeLimit
        });
      }
    }else{
      res.json({ "status": "invalid scan id" });
    }
  }
  catch (error) {
    console.error('Error initiating spider scan:', error);
    res.json({ "status": "fail" });
  }
});

app.put('/get-scan-progress', async (req, res) => {
  console.log("/get-scan-progress")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  let zapID = historyOfScanRequests[targetScanID]["zapID"]
  let storedScanHash = historyOfScanRequests[targetScanID]["hash"]
  let storedStatusOfProcess = historyOfScanRequests[targetScanID]["statusOfProcess"]

  try {
    //if requesting user's hash is valid and the current scan has the statusOfProcess library value set to the zapID
    if (storedScanHash == targetScanIDHash && storedStatusOfProcess == zapID){

      const zapResponse = await getScanProgress(zapID);
      const zapAlertSummaryResponse = await getAlertSummary();

      if (zapResponse.data.status == "100"){
        if (historyOfScanRequests[targetScanID]["statusOfProcess"] != "incomplete" && historyOfScanRequests[targetScanID]["statusOfProcess"] != "broken"){
          historyOfScanRequests[targetScanID]["statusOfProcess"] = "done"
          
          scanningTimerNeeded = false
          waitForScanToFinishClock()

          res.json({ 
            "status": "success",
            "timeElapsed": currentScanTime.toString(),
            "timeLimit": timeLimit,
            "scanProgress": zapResponse.data.status,
            "alertSummary": zapAlertSummaryResponse.data,
            "currentScanTargetURL": currentScanTargetURL
          });
        }  
      }else{
        if (historyOfScanRequests[targetScanID]["statusOfProcess"] == "incomplete"){

          res.json({ 
            "status": "waiting for finish",
            "timeElapsed": currentScanTime.toString(),
            "timeLimit": timeLimit,
            "alertSummary": zapAlertSummaryResponse.data,
            "currentScanTargetURL": currentScanTargetURL
          });
        }else if(historyOfScanRequests[targetScanID]["statusOfProcess"] == "broken"){
          res.json({ 
            "status": "scan broken"
          });
        }else{
          res.json({ 
            "status": "success",
            "timeElapsed": currentScanTime.toString(),
            "timeLimit": timeLimit,
            "scanProgress": zapResponse.data.status,
            "alertSummary": zapAlertSummaryResponse.data,
            "currentScanTargetURL": currentScanTargetURL
          });
        }
      }
    }else if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash && historyOfScanRequests[targetScanID]["statusOfProcess"] == "incomplete"){
      res.json({ 
        "status": "waiting for finish"
      });
    }else{
      res.json({ "status": "invalid scan id" });
    }
  }
  catch (error) {
    console.error('Error initiating spider scan:', error);
    res.json({ "status": "fail" });
  }
});

app.put('/wait-for-scan-to-finish', async (req, res) => {
  console.log("/wait-for-scan-to-finish")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];
  let zapID = historyOfScanRequests[targetScanID]["zapID"]

  if (historyOfScanRequests[currentScanID]["hash"] == targetScanIDHash){
    try {
      if (waitingForScanToFinish == false && isScanning == true){
        const zapScanAlertsResponse = await getMostRecentScanAlerts();
        const zapAlertSummaryResponse = await getAlertSummary();
  
        console.log("waitingForScanToFinish == false && isScanning == true")
  
        if (zapScanAlertsResponse != null && scanningTimerNeeded == false && waitingForScanToFinish == false){
          console.log("SCAN FINISHED")
          res.json({ 
            "status": "success",
            "timeElapsed": currentScanTime.toString(),
            "timeLimit": timeLimit,
            "uniqueScanAlerts": zapScanAlertsResponse[0],
            "confidenceLevelsData": zapScanAlertsResponse[1],
            "alertSummary": zapAlertSummaryResponse.data,
            "currentScanTargetURL": currentScanTargetURL
          });
          isScanning = false
          await clearAlertsForNewScan()
        }else{
          res.json({ "status": "false" });
        }
      }else{
        if (isScanning == true){
          if (waitingForScanToFinish == false){
            console.log("clock called")
            waitForScanToFinishClock()
          }
        }
        res.json({ "status": "false" });
      }
    }
    catch (error) {
      console.error('Error initiating spider scan:', error);
      res.json({ "status": "fail" });
    }
  }else{
    res.json({ "status": "fail" });
  }
});

app.put('/cancel-scan', async (req, res) => {
  console.log("/cancel-scan")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];
  let zapID = historyOfScanRequests[targetScanID]["zapID"]


  try {
    if(targetScanIDHash == historyOfScanRequests[targetScanID]["hash"]){
      console.log("Scan Set to Cancelled")
      historyOfScanRequests[targetScanID]["statusOfProcess"] = "cancelled"
      if (targetScanIDHash == historyOfScanRequests[currentScanID]["hash"]){
        userCancelled = true
      }
      res.json({ "status": "success" });
    }else{
      res.json({ "status": "fail" });
    }
  }
  catch (error) {
    console.error('Error initiating spider scan:', error);
    res.json({ "status": "fail" });
  }
});

// Helper Functions

// SHA-256 Hashing Function used for data security
function applySHA256(message) {
  const sha256Hash = crypto.createHash('sha256');
  sha256Hash.update(message);
  return sha256Hash.digest('hex');
}

// Scan Timing System
async function startScanningTimer(scanID) {
  let counter = 0;
  currentScanTime = 0

  while (counter < timeLimit && scanningTimerNeeded) {
    if(historyOfScanRequests[scanID]["statusOfProcess"] == "cancelled"){
      break
    }
    console.log(`Current Scan Time Count: ${counter}`);
    await delay(1000);
    counter++;
    currentScanTime = counter
  }

  if (historyOfScanRequests[scanID]["statusOfProcess"] == "done"){
    console.log("SCAN DONE, WAITING FOR FINISH")
    scanningTimerNeeded = false
    waitForScanToFinishClock()
    return
  }else if(historyOfScanRequests[scanID]["statusOfProcess"] == "waiting"){
    historyOfScanRequests[scanID]["statusOfProcess"] = "broken"
    console.log("SCAN BROKEN")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    await stopCurrentScan(zapID);
    scanningTimerNeeded = false
    waitForScanToFinishClock()
  }else if(historyOfScanRequests[scanID]["statusOfProcess"] == "cancelled"){
    console.log("SCAN CANCELLED")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    await stopCurrentScan(zapID);
    scanningTimerNeeded = false
    waitForScanToFinishClock()
  }else{
    historyOfScanRequests[scanID]["statusOfProcess"] = "incomplete"
    console.log("SCAN INCOMPLETE")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    await stopCurrentScan(zapID);
    scanningTimerNeeded = false
    waitForScanToFinishClock()
  }
  return
}

async function queueFlowCorrectionClock(){
  while (true){
    if (queueCorrectionCounting == false && isScanning == false && queue.length > 0){
      queueFlowCorrection()
    }
    await delay(1000);
  }
}

// Scan Timing System
async function queueFlowCorrection() {
  queueCorrectionNeeded = true
  queueCorrectionCounting = true
  let timeToDequeue = 20;
  let counter = 0;

  while (counter <= timeToDequeue) {
    console.log(`Current Queue Correction Timer Count: ${counter}`);
    if (queueCorrectionNeeded == false){
      console.log("QUEUE CORRECTION NOT NEEDED")
      queueCorrectionNeeded = false
      queueCorrectionCounting = false
      return
    }
    await delay(1000);
    counter++;
  }

  console.log("QUEUE CORRECTION NEEDED")
  queueCorrectionNeeded = false
  queueCorrectionCounting = false
  let brokenScanID = queue.shift()
  try{
    historyOfScanRequests[brokenScanID]["statusOfProcess"] = "broken"
  }catch{
    
  }
  return

}

async function waitForScanToFinishClock(){
  if (waitingForScanToFinish == false){
    console.log("waitForScanToFinishClock initialized")
    waitingForScanToFinish = true
    let previousAlertAmount = -1
    while (waitingForScanToFinish){
      await delay(5000);
      let totalNumberOfAlertsResponse = await getTotalNumberOfAlerts();

      try{
        let currentAlertAmount = parseInt(totalNumberOfAlertsResponse.data.numberOfAlerts)
        console.log("currentAlertAmount>previousAlertAmount")
        console.log(currentAlertAmount + " > " + previousAlertAmount)
        if (currentAlertAmount>previousAlertAmount){
          previousAlertAmount = currentAlertAmount
        }else{
          console.log("waitingForScanToFinish = false")
          waitingForScanToFinish = false

          //I must find a way to handle disconnected users, since they don't call the last step
          await checkIfUserDisconnectedFromScanner()
    
        }
      }catch{
        console.log("No server response")
      }
    }
  }
  return
}

async function checkIfUserDisconnectedFromScanner(){
  if (isScanning == true){
    console.log("checkIfUserDisconnectedFromScanner")
    checkingIfUserIsDisconnected = true
    for (let i = 0; i < 30; i++) {
      if (userCancelled){
        console.log("userCancelled == true")
        await clearAlertsForNewScan()
        isScanning = false
        checkingIfUserIsDisconnected = false
        return
      }
      console.log("check: " + i)
      await delay(1000);
      // They are missing isScanning == false

      if (isScanning == false){
        console.log("isScanning == false")
        checkingIfUserIsDisconnected = false
        return
      }
    }
    if (isScanning == true){ // If scanning is still true after 30 seconds, user is disconnected, scan is made false, this opens queue
      console.log("isScanning == true")
      await clearAlertsForNewScan()
      isScanning = false
    }
  }
  checkingIfUserIsDisconnected = false
  return
}

// Delay Function used for Timing
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to initiate scan at the given URL
async function initiateScan(targetURL){
  try {
    const zapSpiderRequestUrl = `http://localhost:8080/JSON/spider/action/scan/?url=${encodeURIComponent(targetURL)}&apikey=${zapAPIKey}`;

    const zapResponse = await axios.get(zapSpiderRequestUrl);

    return zapResponse;
  }
  catch (error) {
    console.error('Error initiating spider scan:', error);

    return null;
  }
}

// Function to get current progress of a scan
async function getScanProgress(targetScanID){
  try {
    const zapResponse = await axios.get(`http://localhost:8080/JSON/spider/view/status/?scanId=${targetScanID}&apikey=${zapAPIKey}`);

    return zapResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function to get current progress of a scan
async function getScanResults(zapID){
  try {
    const zapResponse = await axios.get(`http://localhost:8080/JSON/spider/view/fullResults/?scanId=${zapID}&apikey=${zapAPIKey}`);

    return zapResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function to get current progress of a scan
async function getMostRecentScanAlerts(){
  try {
    const zapResponse = await axios.get(`http://localhost:8080/JSON/core/view/alerts/?apikey=${zapAPIKey}&baseurl=&start=&count=&riskId=`);

    // Filter Results
    let fetchedResults = zapResponse.data.alerts

    confidenceLevelReturnData = {}
    populate_confidenceLevelReturnData(fetchedResults);

    // Create a Set to track unique alert identifiers (pluginId)
    const uniqueAlerts = new Set();

    // Filter out duplicate alerts based on 'pluginId'
    const uniqueScanResults = fetchedResults.filter(alert => {
        const identifier = `${alert.alertRef}`;
        if (!uniqueAlerts.has(identifier)) {
            uniqueAlerts.add(identifier);
            // Unique, so keep this alert
            return true;
        }
        // Duplicate ID, so ignore
        return false;
    }).map(alert => ({
        alertData: {
          alertRef: alert.alertRef,
          name: alert.alert,
          risk: alert.risk,
          confidence: alert.confidence,
          description: alert.description,
          solution: alert.solution,
          tags: alert.tags,
          reference: alert.reference,
          other: alert.other
        }
    }));

    return [uniqueScanResults, confidenceLevelReturnData];
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function to get current progress of a scan
async function clearAlertsForNewScan(targetScanID){
  try {
    const zapDeleteAlertsResponse = await axios.get(`http://localhost:8080/JSON/core/action/deleteAllAlerts/?apikey=${zapAPIKey}`);
    const zapRemoveScanResponse = await axios.get(`http://localhost:8080/JSON/spider/action/removeScan/?apikey=${zapAPIKey}&scanId=${targetScanID}`);
    return zapDeleteAlertsResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function to get current progress of a scan
async function stopCurrentScan(targetScanID){
  try {
    const stopResponse = await axios.get(`http://localhost:8080/JSON/spider/action/stop/?scanId=${targetScanID}&apikey=${zapAPIKey}`);
    return stopResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function to get current total number of alerts
async function getTotalNumberOfAlerts(targetScanID){
  try {
    const totalNumberOfAlertsResponse = await axios.get(`http://localhost:8080/JSON/alert/view/numberOfAlerts/?apikey=${zapAPIKey}`);
    return totalNumberOfAlertsResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function that gets number of alerts grouped by each risk level, optionally filtering by URL
async function getAlertSummary(targetScanID){
  try {
    const alertSummaryResponse = await axios.get(`http://localhost:8080/JSON/alert/view/alertsSummary/?apikey=${zapAPIKey}&baseurl=`);
    return alertSummaryResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

function populate_confidenceLevelReturnData(scanResults){
  scanResults.forEach(alert => {
      if (alert.alertRef in confidenceLevelReturnData){
          if (alert.confidence==="Medium")
            confidenceLevelReturnData[alert.alertRef].mediumConfidence.push(alert.url);
          if (alert.confidence==="High")
            confidenceLevelReturnData[alert.alertRef].highConfidence.push(alert.url);
          if (alert.confidence==="Low")
            confidenceLevelReturnData[alert.alertRef].lowConfidence.push(alert.url);
      }
      else{
          confidenceLevelReturnData[alert.alertRef] = {lowConfidence:[],mediumConfidence:[],highConfidence:[]}
          if (alert.confidence==="Medium")
            confidenceLevelReturnData[alert.alertRef].mediumConfidence.push(alert.url);
          if (alert.confidence==="High")
            confidenceLevelReturnData[alert.alertRef].highConfidence.push(alert.url);
          if (alert.confidence==="Low")
            confidenceLevelReturnData[alert.alertRef].lowConfidence.push(alert.url);
      }
  })
} 

// Allow Backend to Listen for Requests
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

queueFlowCorrectionClock();

//////////////////////////////////////////////////////
//Backend Code End
