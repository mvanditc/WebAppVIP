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
const timeLimit = 10 // Time Limit in Seconds
const maxScanAmount = 3

var currentScanTime = 0

// Functional Variables
var queue = []

var isScanning = false
var queueCorrectionNeeded = false
var queueCorrectionCounting = false

var scanningTimerNeeded = false

var currentScanTargetURL = ""

var waitingForScanToFinish = false

var historyOfScanRequests = {} //{scanID: {"hash": hashedData, "targeturl": "www.example.com", "statusOfProcess": status, "zapID": id}} is an example of 1 entry
const scanHistoryProcesses = ["false", "waiting", "done", "broken", "incomplete"]

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
      if (queueCorrectionCounting == false && isScanning == false){
        queueFlowCorrection()
      }
      res.json({
        "status": "success",
        "scanID": currentTimestamp,
        "hash": scanHash
      });
    }else {
      historyOfScanRequests[currentTimestamp] = hashForNewRequestHistoryEntry;
      queue.push(currentTimestamp)
      if (queueCorrectionCounting == false && isScanning == false){
        queueFlowCorrection()
      }
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
        "isScanning": isScanning
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
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try{
    if (isScanning == false){
      const scanIDScanPosition = (queue.indexOf(targetScanID)).toString();
      // If scan is next in queue and credentials match, then process request
      if (scanIDScanPosition == "0"){
        if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash){
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
        isScanning = true
        queueCorrectionNeeded = false
        currentScanTargetURL = historyOfScanRequests[targetScanID]["targetURL"]

        res.json({ "status": "success" });
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

  try {
    if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash && !scanHistoryProcesses.includes(historyOfScanRequests[targetScanID]["statusOfProcess"])){
      let zapID = historyOfScanRequests[targetScanID]["zapID"]

      const zapResponse = await getScanProgress(zapID);
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
            "currentScanTargetURL": currentScanTargetURL
          });
        }  
      }else{
        if (historyOfScanRequests[targetScanID]["statusOfProcess"] == "incomplete"){

          res.json({ 
            "status": "waiting for finish",
            "timeElapsed": currentScanTime.toString(),
            "timeLimit": timeLimit,
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


  try {
    if (waitingForScanToFinish == false && isScanning == true){
      const zapScanResultsResponse = await getScanResults(zapID);
      const zapScanAlertsResponse = await getMostRecentScanAlerts();

      if (zapScanResultsResponse != null && zapScanAlertsResponse != null && scanningTimerNeeded == false && waitingForScanToFinish == false){
        console.log("SCAN FINISHED")
        res.json({ 
          "status": "success",
          "timeElapsed": currentScanTime.toString(),
          "timeLimit": timeLimit,
          "scanResults": zapScanResultsResponse.data,
          "scanAlerts": zapScanAlertsResponse.data,
          "currentScanTargetURL": currentScanTargetURL
        });
        await clearAlertsForNewScan()
        isScanning = false
      }else{
        res.json({ "status": "false" });
      }
    }else{
      if (isScanning = true){
        waitForScanToFinishClock()
      }
      res.json({ "status": "false" });
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
  let timeToDequeue = 10;
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
          checkIfUserDisconnectedFromScanner()
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
    for (let i = 0; i < 6; i++) {
      console.log("check: " + i)
      await delay(5000);
      if (isScanning == false){
        console.log("isScanning == false")
        break
      }
    }
    if (isScanning == true){
      console.log("isScanning == true")
      isScanning = false
      scanningTimerNeeded = false
      waitingForScanToFinish = false
    }
  }
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

    return zapResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function to get current progress of a scan
async function clearAlertsForNewScan(targetScanID){
  try {
    const zapResponse = await axios.get(`http://localhost:8080/JSON/core/action/deleteAllAlerts/?apikey=${zapAPIKey}`);
    return zapResponse;
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

// Allow Backend to Listen for Requests
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

queueFlowCorrectionClock();

//////////////////////////////////////////////////////
//Backend Code End
