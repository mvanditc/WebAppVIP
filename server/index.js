//Backend Code Start
//////////////////////////////////////////////////////
// Requiring
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
var mysql = require('mysql');

// Establishing Connection with Database
var dbConnection = mysql.createConnection({
  host: "localhost",
  user: "michael",
  password: "WebAppVIPDatabase",
  database: 'webappvip'
});

dbConnection.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!");
});

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

// SHA-256 Hashing Function used for data security
function applySHA256(message) {
  const sha256Hash = crypto.createHash('sha256');
  sha256Hash.update(message);
  return sha256Hash.digest('hex');
}

// Client Usability Settings
let adminCredentials = {
  "username": applySHA256("admin"),
  "password": applySHA256("123123123"),
  "loginToken": "",
  "previousLoginLocation": ""
}

let adminManagedVariables = {
  "scanTimeLimit": "20", // in Seconds
  "maxScansPerDay": "99",
  "adminDemoMode": "false",
  "siteMOTDHTML": `<p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor"</p>`
}
let timeLimit = parseInt(adminManagedVariables["scanTimeLimit"])
let maxScanAmount = parseInt(adminManagedVariables["maxScansPerDay"])

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

var siteSettingsChanged = false

var historyOfScanRequests = {} //{scanID: {"hash": hashedData, "targeturl": "www.example.com", "statusOfProcess": status, "zapID": id}} is an example of 1 entry
const scanHistoryProcesses = ["false", "waiting", "done", "broken", "incomplete", "cancelled"]

let confidenceLevelReturnData = {};

// The following dictionary variables represent data stored in the backend:
let scanAttemptsForEachUser = {}

let allScanAttemptsMade = {}

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

// Defining ExpressJS Routes
app.put('/get-sql-view', (req, res) => {
  const requestData = req.body;

  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];
  let queriedDate = requestData["date"];
  let queriedColumn = requestData["column"];

  let dateParts = queriedDate.split("-");
  let queriedYear = dateParts[0]
  let queriedMonth = dateParts[1]

  if (applySHA256(attemptedUsername) == adminCredentials["username"]){
    try{
        if (adminCredentials["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")
            let sql = `SELECT date, ${queriedColumn} FROM dailyscansanalyticsdata WHERE MONTH(date) = ${queriedMonth} AND YEAR(date) = ${queriedYear}`
            dbConnection.query(sql, function (err, result) {
              if (err) {
                res.json({ "status": "fail" });
              }
              res.json({"view": result});
            });
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }
    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
  }else{
    res.json({"status": 'fail'});
  }
});

app.put('/get-sql-initial-data', (req, res) => {
  const requestData = req.body;

  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];

  if (applySHA256(attemptedUsername) == adminCredentials["username"]){
    try{
        if (adminCredentials["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")
            let sql1 = "SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') FROM dailyscansanalyticsdata"
            let sql2 = "SHOW COLUMNS FROM dailyscansanalyticsdata"
            dbConnection.query(sql1, function (err, result1) {
              if (err) {
                res.json({ "status": "fail" });
              }
              dbConnection.query(sql2, function (err, result2) {
                if (err) {
                  res.json({ "status": "fail" });
                }
                res.json({
                  "dates": result1,
                  "columns": result2
                });
              });
            });
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }
    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
  }else{
    res.json({"status": 'fail'});
  }
});

app.put('/stop-current-scan-early', async (req, res) => {
  console.log("/stop-current-scan-early")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try{
    if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash){
      historyOfScanRequests[targetScanID]["statusOfProcess"] = "end early"
      allScanAttemptsMade[targetScanID]["scanStatus"] = "end early"

      await stopCurrentScan()

      res.json({
        "status": "success"
      });
    }else{
      res.json({ "status": "invalid scan id" });
    }
  }catch(error){
    console.error('queue processing error occurred:', error.message);
    res.json({ "status": "fail" });
  }
});

app.get('/all-scan-attempts-data', (req, res) => {
  res.json(allScanAttemptsMade);
});

app.get('/user-scans-data', (req, res) => {
  res.json(scanAttemptsForEachUser);
});

app.get('/get-site-motd', (req, res) => {
  res.json({"motd": adminManagedVariables["siteMOTDHTML"]});
});

app.get('/get-total-alerts-found', (req, res) => {
  let totalAlertsFound = getNumberOfAlertsFoundTotal()
  res.json({"stat": totalAlertsFound});
});

app.get('/getusers', (req, res) => {
  res.send(adminCredentials);
});

app.put('/change-site-motd', (req, res) => {
  console.log("/change-site-motd")
  const requestData = req.body;
  let valueForSiteMOTD = requestData["valueForSiteMOTD"];
  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];

  if (applySHA256(attemptedUsername) == adminCredentials["username"]){
    try{
        if (adminCredentials["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")

            adminManagedVariables["siteMOTDHTML"] = valueForSiteMOTD
            console.log("Site MOTD Changed...")

            res.json({"status": 'success'})
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }
    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
  }else{
    res.json({"status": 'fail'});
  }
});

app.put('/change-site-configuration', (req, res) => {
  console.log("/change-site-configuration")
  const requestData = req.body;
  let valueForScanSeconds = requestData["valueForScanSeconds"];
  let valueForScanPerDay = requestData["valueForScanPerDay"];
  let valueForDemoMode = requestData["demoMode"]

  if (valueForScanSeconds == "null"){
    valueForScanSeconds = adminManagedVariables["scanTimeLimit"]
  }
  if (valueForScanPerDay == "null"){
    valueForScanPerDay = adminManagedVariables["maxScansPerDay"]
  }
  if (valueForDemoMode == "null"){
    valueForDemoMode = adminManagedVariables["adminDemoMode"]
  }
  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];

  if (applySHA256(attemptedUsername) == adminCredentials["username"]){
    try{
        if (adminCredentials["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")
            siteSettingsChanged = true
            console.log(requestData["valueForScanSeconds"])
            console.log(requestData["valueForScanPerDay"])
            console.log(valueForScanSeconds)
            console.log(valueForScanPerDay)
            siteSettingsChangedClock(valueForScanSeconds, valueForScanPerDay, valueForDemoMode)

            res.json({"status": 'success'})
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }
    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
  }else{
    res.json({"status": 'fail'});
  }
});

app.put('/get-site-daily-stats-as-admin', (req, res) => {
  const requestData = req.body;

  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];

  if (applySHA256(attemptedUsername) == adminCredentials["username"]){
    try{
        if (adminCredentials["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")
            res.json({
              "status": 'success',
              "dailyStats": {
                "usersQueued": queue.length,
                "scansAttempted": getNumberOfScansAttemptedDaily(),
                "alertsFound": getNumberOfAlertsFoundDaily(),
                "queueAutoCorrections": getNumberOfQueueAutoCorrectionsDaily(),
                "scanCancels": getNumberOfScanCancelsDaily(),
                "completedScans": getNumberOfCompletedScansDaily()
              }
            });
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }
    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
  }else{
    res.json({"status": 'fail'});
  }
});

app.put('/get-site-configurations-for-admin', (req, res) => {
  const requestData = req.body;

  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];

  if (applySHA256(attemptedUsername) == adminCredentials["username"]){
    try{
        if (adminCredentials["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")
            res.json({
              "status": 'success',
              "siteSettings": {
                "scanSecondsLimit": timeLimit,
                "maxScansPerDay": maxScanAmount,
                "adminDemoMode": adminManagedVariables["adminDemoMode"]
              }
            });
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }
    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
  }else{
    res.json({"status": 'fail'});
  }
});

app.put('/attempt-authentication', (req, res) => {
  const requestData = req.body;

  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];

  if (applySHA256(attemptedUsername) == adminCredentials["username"]){
    try{
        console.log(adminCredentials["loginToken"])
        console.log(attemptedLoginToken)
        if (adminCredentials["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")
            res.json({"status": 'success'});
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }

    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
  }else{
    res.json({"status": 'fail'});
  }
});

app.put('/attempt-login', (req, res) => {
  const requestData = req.body;

  let attemptedUsername = requestData["username"];
  let attemptedPassword = requestData["password"];

  try{
      if (adminCredentials["username"] == applySHA256(attemptedUsername)){
        if (adminCredentials["password"] == applySHA256(attemptedPassword)){
          let currentTimestamp = (Date.now()).toString()
          let randomValue = (Math.random()).toString();
          let newLoginToken = applySHA256(attemptedUsername + "-" + currentTimestamp + "-" + randomValue)
          adminCredentials["loginToken"] = newLoginToken;
          console.log("ATTEMPTING LOGIN: SUCCESS")
          res.json({
              "status": 'success',
              "loginToken": newLoginToken
          });
      }else{
          console.log("ATTEMPTING LOGIN: Incorrect Password")
          res.json({"status": 'fail'});
      }
      }else{
        console.log("ATTEMPTING LOGIN: Incorrect Username")
        res.json({"status": 'fail'});
      }

  }catch(error){
    console.error('attempt login error occured:', error.message);
    res.json({"status": 'fail'});
  }
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
  const requestData = req.body;
  let scanTargetURL = requestData["url"];
  let givenUserID = requestData["userid"];
  let attemptedUsername = requestData["username"];
  let attemptedLoginToken = requestData["loginToken"];

  let currentAdminDemoModeStatus = adminManagedVariables["adminDemoMode"]

  if (currentAdminDemoModeStatus == "true"){
    if (attemptedLoginToken != undefined && attemptedUsername != undefined){
      if (applySHA256(attemptedUsername) == adminCredentials["username"]){
        try{
            console.log(adminCredentials["loginToken"])
            console.log(attemptedLoginToken)
            if (adminCredentials["loginToken"] == attemptedLoginToken){
              let isValidLinkTest = isValidLink(scanTargetURL)
              let isUnrestrictedLinkTest = isUnrestrictedLink(scanTargetURL)
            
              if (isValidLinkTest && isUnrestrictedLinkTest){
                let currentTimestamp = Date.now()
                currentTimestamp = currentTimestamp.toString()
            
                let randomNumber1 = Math.floor(Math.random() * 255);
                let randomNumber2 = Math.floor(Math.random() * 255);
                let randomNumber3 = Math.floor(Math.random() * 255);
                let randomNumber4 = Math.floor(Math.random() * 255);
            
                let scanHash = applySHA256(currentTimestamp + randomNumber1 + randomNumber2 + randomNumber3 + randomNumber4)
            
                var userHasEnoughScans = false
            
                let functionResponse = doesUserHaveSufficientScansLeft(givenUserID, scanHash)
                let userNeedsNewID = false
                let newUserID = ""
                userHasEnoughScans = functionResponse[0]
            
                let userScansLeft = functionResponse[2]
            
                console.log(functionResponse)
            
                if (functionResponse[1] != false){
                  userNeedsNewID = true
                  newUserID = functionResponse[1]
                }
            
                if (userHasEnoughScans){
                  try{
                
                    let hashForNewRequestHistoryEntry = {
                      "hash": scanHash,
                      "targetURL": scanTargetURL,
                      "statusOfProcess": "false",
                      "zapID": "-1"
                    }
                
                    // Logic for Entering Request Into Scan Request History
                    if (historyOfScanRequests.hasOwnProperty(currentTimestamp)) {
                      // This code finds a new index for the entry
                      while (historyOfScanRequests.hasOwnProperty(currentTimestamp)){
                        currentTimestamp = (Date.now()).toString()
                      }
                      historyOfScanRequests[currentTimestamp] = hashForNewRequestHistoryEntry;
                      queue.push(currentTimestamp)
            
                      if (userNeedsNewID){
                        res.json({
                          "status": "success",
                          "scanID": currentTimestamp,
                          "hash": scanHash,
                          "userID": newUserID,
                          "scansLeft": userScansLeft
                        });
                      }else{
                        res.json({
                          "status": "success",
                          "scanID": currentTimestamp,
                          "hash": scanHash,
                          "userID": "false",
                          "scansLeft": userScansLeft
                        });
                      }
                    }else {
                      historyOfScanRequests[currentTimestamp] = hashForNewRequestHistoryEntry;
                      queue.push(currentTimestamp)
                      res.json({
                        "status": "success",
                        "scanID": currentTimestamp,
                        "hash": scanHash,
                        "userID": newUserID,
                        "scansLeft": userScansLeft
                      });
                    }
                  }catch{
                    res.json({ "status": "fail" });
                  }
                }else{
                  res.json({ "status": "max scans" });
                }
              }else{
                res.json({ "status": "fail" });
              }
            }else{
                console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
                res.json({"status": 'admin mode'});
            }
    
        }catch{
            console.log("ATTEMPTING AUTHENTICATION: User Not Found")
            res.json({"status": 'admin mode'});
        }
      }else{
        res.json({"status": 'admin mode'});
      }
    }else{
      res.json({"status": 'admin mode'});
    }
  }else{
    let isValidLinkTest = isValidLink(scanTargetURL)
    let isUnrestrictedLinkTest = isUnrestrictedLink(scanTargetURL)
  
    if (isValidLinkTest && isUnrestrictedLinkTest){
      let currentTimestamp = Date.now()
      currentTimestamp = currentTimestamp.toString()
  
      let randomNumber1 = Math.floor(Math.random() * 255);
      let randomNumber2 = Math.floor(Math.random() * 255);
      let randomNumber3 = Math.floor(Math.random() * 255);
      let randomNumber4 = Math.floor(Math.random() * 255);
  
      let scanHash = applySHA256(currentTimestamp + randomNumber1 + randomNumber2 + randomNumber3 + randomNumber4)
  
      var userHasEnoughScans = false
  
      let functionResponse = doesUserHaveSufficientScansLeft(givenUserID, scanHash)
      let userNeedsNewID = false
      let newUserID = ""
      userHasEnoughScans = functionResponse[0]
  
      let userScansLeft = functionResponse[2]
  
      console.log(functionResponse)
  
      if (functionResponse[1] != false){
        userNeedsNewID = true
        newUserID = functionResponse[1]
      }
  
      if (userHasEnoughScans){
        try{
      
          let hashForNewRequestHistoryEntry = {
            "hash": scanHash,
            "targetURL": scanTargetURL,
            "statusOfProcess": "false",
            "zapID": "-1"
          }
      
          // Logic for Entering Request Into Scan Request History
          if (historyOfScanRequests.hasOwnProperty(currentTimestamp)) {
            // This code finds a new index for the entry
            while (historyOfScanRequests.hasOwnProperty(currentTimestamp)){
              currentTimestamp = (Date.now()).toString()
            }
            historyOfScanRequests[currentTimestamp] = hashForNewRequestHistoryEntry;
            queue.push(currentTimestamp)
  
            if (userNeedsNewID){
              res.json({
                "status": "success",
                "scanID": currentTimestamp,
                "hash": scanHash,
                "userID": newUserID,
                "scansLeft": userScansLeft
              });
            }else{
              res.json({
                "status": "success",
                "scanID": currentTimestamp,
                "hash": scanHash,
                "userID": "false",
                "scansLeft": userScansLeft
              });
            }
          }else {
            historyOfScanRequests[currentTimestamp] = hashForNewRequestHistoryEntry;
            queue.push(currentTimestamp)
            res.json({
              "status": "success",
              "scanID": currentTimestamp,
              "hash": scanHash,
              "userID": newUserID,
              "scansLeft": userScansLeft
            });
          }
        }catch{
          res.json({ "status": "fail" });
        }
      }else{
        res.json({ "status": "max scans" });
      }
    }
  }
});

app.put('/remove-scan-from-queue', (req, res) => {
  console.log("/remove-scan-from-queue")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];
  let requestingUserID = requestData["userid"]

  try{
    if (queue.includes(targetScanID)){
      const scanIDScanPosition = (queue.indexOf(targetScanID)).toString();

      if (queueCorrectionCounting == true && scanIDScanPosition == "0"){
        queueCorrectionNeeded = false
      }

      if (historyOfScanRequests[targetScanID]["hash"] == targetScanIDHash){
        queue.splice(scanIDScanPosition, 1);
        scanAttemptsForEachUser[requestingUserID][targetScanIDHash] = "cancelled"
        historyOfScanRequests[targetScanID]["statusOfProcess"] = "cancelled"

        res.json({"status": "success"});
      }else{
        res.json({ "status": "invalid scan id" });
      }
    }else{
      res.json({ "status": "not found" });
    }
  }catch(error){
    console.error('removing scan from queue error occurred:', error.message);
    res.json({ "status": "fail" });
  }
});

app.put('/get-scan-queue-position', (req, res) => {
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];
  let requestingUserID = requestData["userid"]

  try{
    if (queueCorrectionCounting == false && isScanning == false){
      queueFlowCorrection()
    }

    const scanIDScanPosition = (queue.indexOf(targetScanID)).toString();

    if (scanIDScanPosition !== "-1") {
      let functionResponse = doesUserHaveSufficientScansLeft(requestingUserID, targetScanIDHash)
      let userScansLeft = functionResponse[2]

      res.json({
        "status": "success",
        "position": scanIDScanPosition,
        "isScanning": isScanning,
        "checkingIfUserIsDisconnected": checkingIfUserIsDisconnected,
        "scansLeft": userScansLeft
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
    console.error('getting scan queue position error occurred:', error.message);
    res.json({ "status": "fail" });
  }
});

app.put('/process-queued-scan-if-next', (req, res) => {
  console.log("/process-queued-scan-if-next")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try{
    if (isScanning == false && checkingIfUserIsDisconnected == false && siteSettingsChanged == false){
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
      res.json({
        "status": "scan tool busy",
        "siteSettingsChanged": siteSettingsChanged
    });
    }
  }catch(error){
    console.error('queue processing error occurred:', error.message);
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

        allScanAttemptsMade[targetScanID] = {
          "targetURL": historyOfScanRequests[targetScanID]["targetURL"],
          "scanStatus": "incomplete",
          "totalAlertsFound": 0,
          "timeElapsed": "null",
          "date": getCurrentDate()
        }
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

  try{
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
            if (historyOfScanRequests[targetScanID]["statusOfProcess"] != "end early"){
              historyOfScanRequests[targetScanID]["statusOfProcess"] = "done"
              allScanAttemptsMade[targetScanID]["scanStatus"] = "done"
            }
            
            scanningTimerNeeded = false
            waitForScanToFinishClock()
  
            res.json({ 
              "status": "success",
              "timeElapsed": currentScanTime,
              "timeLimit": timeLimit,
              "scanProgress": zapResponse.data.status,
              "alertSummary": zapAlertSummaryResponse.data,
              "currentScanTargetURL": currentScanTargetURL
            });
          }  
        }else{
          if (historyOfScanRequests[targetScanID]["statusOfProcess"] == "incomplete"){
            allScanAttemptsMade[targetScanID]["scanStatus"] = "incomplete"
  
            res.json({ 
              "status": "waiting for finish",
              "timeElapsed": currentScanTime.toString(),
              "timeLimit": timeLimit,
              "alertSummary": zapAlertSummaryResponse.data,
              "currentScanTargetURL": currentScanTargetURL
            });
          }else if(historyOfScanRequests[targetScanID]["statusOfProcess"] == "broken"){
            allScanAttemptsMade[targetScanID]["scanStatus"] = "broken"
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
  }catch{
    res.json({ "status": "fail" });
  }
});

app.put('/wait-for-scan-to-finish', async (req, res) => {
  console.log("/wait-for-scan-to-finish")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try{
    if (historyOfScanRequests[currentScanID]["hash"] == targetScanIDHash){
      if (waitingForScanToFinish == false && isScanning == true){
        const zapScanAlertsResponse = await getMostRecentScanAlerts();
        const zapAlertSummaryResponse = await getAlertSummary();
  
        console.log("waitingForScanToFinish == false && isScanning == true")
  
        if (zapScanAlertsResponse != null && scanningTimerNeeded == false && waitingForScanToFinish == false){
          console.log("SCAN FINISHED")
          let zapAlertSummary = zapAlertSummaryResponse.data["alertsSummary"]
          let totalAlerts = parseInt(zapAlertSummary["High"]) + parseInt(zapAlertSummary["Low"]) + parseInt(zapAlertSummary["Medium"]) + parseInt(zapAlertSummary["Informational"])
  
          allScanAttemptsMade[targetScanID]["totalAlertsFound"] = totalAlerts
          allScanAttemptsMade[targetScanID]["timeElapsed"] = currentScanTime
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
    }else{
      res.json({ "status": "fail" });
    }
  }catch (error) {
      console.error('Error initiating spider scan:', error);
      res.json({ "status": "fail" });
  }
});

app.put('/cancel-scan', async (req, res) => {
  console.log("/cancel-scan")
  const requestData = req.body;
  let targetScanID = requestData["scanid"];
  let targetScanIDHash = requestData["hash"];

  try{
    let zapID = historyOfScanRequests[targetScanID]["zapID"]

    try {
      if(targetScanIDHash == historyOfScanRequests[targetScanID]["hash"]){
        console.log("Scan Set to Cancelled")
        historyOfScanRequests[targetScanID]["statusOfProcess"] = "cancelled"
        allScanAttemptsMade[targetScanID]["scanStatus"] = "cancelled"
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
  }catch{
    res.json({ "status": "fail" });
  }
});

// Helper Functions

// Scan Timing System
async function startScanningTimer(scanID) {
  let counter = 0;
  currentScanTime = 0

  while (counter < timeLimit && scanningTimerNeeded) {
    if(historyOfScanRequests[scanID]["statusOfProcess"] == "cancelled" || historyOfScanRequests[scanID]["statusOfProcess"] == "end early"){
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
    allScanAttemptsMade[targetScanID]["scanStatus"] = "broken"
    console.log("SCAN BROKEN")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    await stopCurrentScan();
    scanningTimerNeeded = false
    waitForScanToFinishClock()
  }else if(historyOfScanRequests[scanID]["statusOfProcess"] == "cancelled"){
    console.log("SCAN CANCELLED")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    await stopCurrentScan();
    scanningTimerNeeded = false
    waitForScanToFinishClock()
  }else if(historyOfScanRequests[scanID]["statusOfProcess"] == "end early"){
    allScanAttemptsMade[scanID]["scanStatus"] = "end early"
    console.log("SCAN ENDED EARLY")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    await stopCurrentScan();
    scanningTimerNeeded = false
    waitForScanToFinishClock()
  }else{
    historyOfScanRequests[scanID]["statusOfProcess"] = "incomplete"
    allScanAttemptsMade[scanID]["scanStatus"] = "incomplete"
    console.log("SCAN INCOMPLETE")
    let zapID = historyOfScanRequests[scanID]["zapID"]
    await stopCurrentScan();
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
  let timeToDequeue = 15;
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
    allScanAttemptsMade[brokenScanID]["scanStatus"] = "broken"
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
    for (let i = 0; i < 15; i++) {
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

async function siteSettingsChangedClock(newScanSecondsValue, newMaxScansPerDayValue, valueForDemoMode){
  console.log("siteSettingsChangedClock Initialized")
  while (true){
    console.log("siteSettingsChangedClock Check")
    if (isScanning == false && waitingForScanToFinish == false){
      adminManagedVariables["scanTimeLimit"] = newScanSecondsValue
      adminManagedVariables["maxScansPerDay"] = newMaxScansPerDayValue
      adminManagedVariables["adminDemoMode"] = valueForDemoMode

      console.log(newScanSecondsValue)
      console.log(typeof newScanSecondsValue)
      console.log(newMaxScansPerDayValue)
      console.log(typeof newMaxScansPerDayValue)
      console.log(adminManagedVariables)

      timeLimit = parseInt(adminManagedVariables["scanTimeLimit"])
      maxScanAmount = parseInt(adminManagedVariables["maxScansPerDay"])
      console.log("Site Settings Changed")
      siteSettingsChanged = false
      return true
    }
    await delay(10000);
  }
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
    const zapRemoveScanResponse = await axios.get(`http://localhost:8080/JSON/spider/action/removeAllScans/?apikey=${zapAPIKey}`);
    return zapDeleteAlertsResponse;
  }
  catch (error) {
      console.error('Error initiating spider scan:', error);

      return null;
  }
}

// Function to get current progress of a scan
async function stopCurrentScan(){
  try {
    const stopResponse = await axios.get(`http://localhost:8080/JSON/spider/action/stopAllScans/?apikey=${zapAPIKey}`);
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

function getCurrentDate(){
  var currentDate = new Date();

  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so January is 0, February is 1, etc.
  var currentDay = currentDate.getDate();

  // Formatting month and day to have leading zeros if needed
  currentMonth = currentMonth < 10 ? '0' + currentMonth : currentMonth;
  currentDay = currentDay < 10 ? '0' + currentDay : currentDay;

  // Output in yy/mm/dd format
  var formattedDate = currentYear.toString().substr(-2) + '/' + currentMonth + '/' + currentDay;
  return formattedDate
}

function doesUserHaveSufficientScansLeft(givenUserID, scanHash){
  let currentDate = getCurrentDate();
  let currentTimestamp = (Date.now()).toString()

  if (givenUserID == "empty" || !scanAttemptsForEachUser.hasOwnProperty(givenUserID)){
    let newUserID = applySHA256(currentTimestamp)
    scanAttemptsForEachUser[newUserID] = {[scanHash]: currentDate}
    return [true, newUserID, 1]

  }else{
    if (scanAttemptsForEachUser.hasOwnProperty(givenUserID)) {
      let scansLeft = parseInt(adminManagedVariables["maxScansPerDay"])

      var keys = Object.keys(scanAttemptsForEachUser[givenUserID]);
      for (var i = keys.length - 1; i >= 0; i--) {
        if (scanAttemptsForEachUser[givenUserID][keys[i]] == currentDate){
          scansLeft-=1
        }
        if (scansLeft <= 0){
          console.log("Scan Limit Exceeded")
          return [false, false, scansLeft]
        }
      }
      scanAttemptsForEachUser[givenUserID][scanHash] = currentDate
      return [true, false, scansLeft]
    }
    return [false, false, 0]
  }
}

function getNumberOfScansAttemptedDaily(){
  // Extract keys into an array
  var scanIDs = Object.keys(allScanAttemptsMade);

  let currentDate = getCurrentDate()

  let foundScans = 0

  // Iterate over the keys array in reverse order
  for (var i = scanIDs.length - 1; i >= 0; i--) {
    var key = scanIDs[i];
    var scanDetails = allScanAttemptsMade[key];
    if (scanDetails["date"] == currentDate){
      foundScans+=1
    }
  }

  return foundScans
}

function getNumberOfAlertsFoundDaily(){
  // Extract keys into an array
  var scanIDs = Object.keys(allScanAttemptsMade);

  let currentDate = getCurrentDate()

  let foundAlerts = 0

  // Iterate over the keys array in reverse order
  for (var i = scanIDs.length - 1; i >= 0; i--) {
    var key = scanIDs[i];
    var scanDetails = allScanAttemptsMade[key];
    if (scanDetails["date"] == currentDate){
      foundAlerts+=scanDetails["totalAlertsFound"]
    }
  }

  return foundAlerts
}

function getNumberOfAlertsFoundTotal(){
  // Extract keys into an array
  var scanIDs = Object.keys(allScanAttemptsMade);

  let foundAlerts = 0

  // Iterate over the keys array in reverse order
  for (var i = scanIDs.length - 1; i >= 0; i--) {
    var key = scanIDs[i];
    var scanDetails = allScanAttemptsMade[key];
    foundAlerts+=scanDetails["totalAlertsFound"]
  }

  return foundAlerts
}

function getNumberOfQueueAutoCorrectionsDaily(){
  // Extract keys into an array
  var scanIDs = Object.keys(historyOfScanRequests);

  let currentDate = getCurrentDate()

  let foundScanQueueCorrections = 0

  // Iterate over the keys array in reverse order
  for (var i = scanIDs.length - 1; i >= 0; i--) {
    var key = scanIDs[i];
    var scanDetails = historyOfScanRequests[key];
    if (allScanAttemptsMade[key]["date"] == currentDate && scanDetails["statusOfProcess"] == "broken"){
      foundScanQueueCorrections+=1
    }
  }

  return foundScanQueueCorrections
}

function getNumberOfScanCancelsDaily(){
  // Extract keys into an array
  var scanIDs = Object.keys(historyOfScanRequests);

  let currentDate = getCurrentDate()

  let foundScanCancels = 0

  // Iterate over the keys array in reverse order
  for (var i = scanIDs.length - 1; i >= 0; i--) {
    var key = scanIDs[i];
    var scanDetails = historyOfScanRequests[key];
    if (allScanAttemptsMade[key]["date"] == currentDate && scanDetails["statusOfProcess"] == "cancelled"){
      foundScanCancels+=1
    }
  }

  return foundScanCancels
}

function getNumberOfCompletedScansDaily(){
  // Extract keys into an array
  var scanIDs = Object.keys(historyOfScanRequests);

  let currentDate = getCurrentDate()

  let foundScansCompleted = 0

  // Iterate over the keys array in reverse order
  for (var i = scanIDs.length - 1; i >= 0; i--) {
    var key = scanIDs[i];
    var scanDetails = historyOfScanRequests[key];
    if (allScanAttemptsMade[key]["date"] == currentDate && scanDetails["scanStatus"] == "done"){
      foundScansCompleted+=1
    }else if(allScanAttemptsMade[key]["date"] == currentDate && allScanAttemptsMade[key]["scanStatus"] == "end early"){
      foundScansCompleted+=1
    }
  }

  return foundScansCompleted
}

function isValidLink(str) {
  //Check to see if link is proper and host is not localhost or 127.0.0.1
  var urlPattern = /^https?:\/\/[^ "]+$/;
  var urlPatternTestResults = urlPattern.test(str);

  // Test the string against the URL pattern
  return urlPatternTestResults
}

function isUnrestrictedLink(str) {
  //Check to see if link is proper and host is not localhost or 127.0.0.1
  let loopBackCharacters = str.substring(0, 16);
  if (loopBackCharacters == "http://127.0.0.1" || loopBackCharacters == "http://localhost"){
    return false
  }
  loopBackCharacters = str.substring(0, 17);
  if (loopBackCharacters == "https://127.0.0.1" || loopBackCharacters == "https://localhost"){
    return false
  }
  loopBackCharacters = str.substring(0, 11);
  if (loopBackCharacters == "http://127."){
    return false
  }
  loopBackCharacters = str.substring(0, 12);
  if (loopBackCharacters == "https://127."){
    return false
  }

  return true;
}

async function prepareZAPForServer(){
  // Stop All ZAP Scans
  const alertSummaryResponse = await axios.get(`http://localhost:8080/JSON/spider/action/stopAllScans/?apikey=${zapAPIKey}`);
  const zapDeleteAlertsResponse = await axios.get(`http://localhost:8080/JSON/core/action/deleteAllAlerts/?apikey=${zapAPIKey}`);
  const zapRemoveScanResponse = await axios.get(`http://localhost:8080/JSON/spider/action/removeAllScans/?apikey=${zapAPIKey}`);
  
  // Allow Backend to Listen for Requests
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  return alertSummaryResponse;
}
prepareZAPForServer()

queueFlowCorrectionClock();
//////////////////////////////////////////////////////
//Backend Code End
