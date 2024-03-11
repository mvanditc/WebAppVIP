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
const { time } = require('console');

// API Key to use ZAP
const zapAPIKey = "ljhuthfiai88rg6t58ia539434"

// Client Usability Settings
const timeLimit = 10 // Time Limit in Seconds
const maxScanAmount = 3

// Functional Variables
var queue = []

var isScanning = false
var queueCorrectionNeeded = false
var queueCorrectionCounting = false

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
        "position": scanIDScanPosition
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

        startScanningTimer(targetScanID)
        isScanning = true
        queueCorrectionNeeded = false

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
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try {
    if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash && !scanHistoryProcesses.includes(historyOfScanRequests[targetScanID]["statusOfProcess"])){
      let zapID = historyOfScanRequests[targetScanID]["zapID"]

      const zapResponse = await getScanProgress(zapID);
      if (zapResponse.data.status == "100"){
        if (historyOfScanRequests[targetScanID]["statusOfProcess"] != "incomplete" && historyOfScanRequests[targetScanID]["statusOfProcess"] != "broken"){
          const zapScanResultsResponse = await getScanResults(zapID);
          const zapScanAlertsResponse = await getMostRecentScanAlerts();
          const zapClearResponse = await clearAlertsForNewScan();

          historyOfScanRequests[targetScanID]["statusOfProcess"] = "done"

          res.json({ 
            "status": "success",
            "scanProgress": zapResponse.data.status,
            "scanResults": zapScanResultsResponse.data,
            "scanAlerts": zapScanAlertsResponse.data
          });
        }  
      }else{
        if (historyOfScanRequests[targetScanID]["statusOfProcess"] == "incomplete"){
          const zapScanResultsResponse = await getScanResults(zapID);
          const zapScanAlertsResponse = await getMostRecentScanAlerts();
          const zapClearResponse = await clearAlertsForNewScan();

          historyOfScanRequests[targetScanID]["statusOfProcess"] = "done"

          isScanning = false

          res.json({ 
            "status": "success",
            "scanProgress": zapResponse.data.status,
            "scanResults": zapScanResultsResponse.data,
            "scanAlerts": zapScanAlertsResponse.data
          });
        }else if(historyOfScanRequests[targetScanID]["statusOfProcess"] == "broken"){
          res.json({ 
            "status": "scan broken"
          });
        }else{
          res.json({ 
            "status": "success",
            "scanProgress": zapResponse.data.status
          });
        }
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

  while (counter <= timeLimit) {
    console.log(`Current Scan Time Count: ${counter}`);
    await delay(1000);
    counter++;
  }

  if (historyOfScanRequests[scanID]["statusOfProcess"] == "done"){
    console.log("SCAN DONE")
    return
  }else if(historyOfScanRequests[scanID]["statusOfProcess"] == "waiting"){
    historyOfScanRequests[scanID]["statusOfProcess"] = "broken"
    console.log("SCAN BROKEN")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    const zapStopScanResponse = await stopCurrentScan(zapID);
    isScanning = false
  }else{
    historyOfScanRequests[scanID]["statusOfProcess"] = "incomplete"
    console.log("SCAN INCOMPLETE")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    const zapStopScanResponse = await stopCurrentScan(zapID);
    isScanning = false
  }
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

// Allow Backend to Listen for Requests
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

queueFlowCorrectionClock();

//////////////////////////////////////////////////////
//Backend Code End
