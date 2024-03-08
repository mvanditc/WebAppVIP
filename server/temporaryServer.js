// import libraries
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 8800;

const config = require('./config.json');
const scanDataPath = path.join(__dirname, "../database/data.json");
const userDataPath = path.join(__dirname, "../database/user.json");
const counterFilePath = path.join(__dirname, "../database/counter.txt");
const vulnerabilityResultsPath = require('../database/webScraperResults1.json');
const apiKey = config.apiKey;

app.use(cors());
app.use(bodyParser.json());

let scanQueue = [];
let isScanning = false;
let savedScanId = null;
let returnInfo = {};
let globalPluginIdsArray = {};

// Message to display on server
app.get('/', (req, res) => {
    res.send('Server is running and reading from the database');
});

// Read file that contains scan results
app.get("/data", (req, res) => {
    const data = JSON.parse(fs.readFileSync(scanDataPath));
    res.json(data);
});

app.delete("/removeScanFromQueue/:id", async (req, res) => {
    const id = req.params.id;
    scanQueue = scanQueue.filter((scanObj) => scanObj.id !== id);
    res.status(200).send();
})

app.get("/checkUserWithinScanLimit", async (req, res) => {
    const userIP = req.ip;
    const canProceed = await validateUser(userIP);

    if (canProceed) {
        res.status(200).send();
    }
    else {
        console.log("User has reached the limit of scans allowed in the past 24 hours.");
        res.status(403).json({ error: "Limit reached" });
    }
})

// Perform scan using zap spider scan api
app.post("/addScanToQueue", async (req, res) => {
    const url = req.body.url;
    const userIP = req.ip;
    const id = req.body.id;

    try {
        const scanRequest = { ip: userIP, url: url, id: id };

        // Add new scan request to the queue
        scanQueue.push(scanRequest);

        res.status(200).json({ url: url });
    } catch (error) {
        console.log('Error with adding scan to queue, ', error);
        res.status(403).json({ error: 'Error adding scan to queue' });
    }
});

app.get('/submit', async (req, res) => {
    const scanCompleted = await processScanQueue();
    if (scanCompleted) {
        res.status(200).json({ scanId: savedScanId });
    }
})

const processScanQueue = async () => {
    // Check for pending requests
    if (scanQueue.length > 0 && !isScanning) {
        // Sets this boolean to true so that other scans do not start
        isScanning = true;
        // Dequeue first scan request from queue
        const scanRequest = scanQueue[0];
        const ip = scanRequest.ip;
        const url = scanRequest.url;

        try {
            const scanInitiated = await initiateScan(scanRequest);
            if (scanInitiated) {
                console.log(`Scan started on url --> ${url}`);
                return true;
            }
        } catch (error) {
            // If you get this error, ensure you have added your api key to config.json
            console.error('Error initiating spider scan:', error);
            // Process next scan request
            await processScanQueue();
        }
    }
    else {
        return false;
    }
}

// Function to initiate scan at the given URL
const initiateScan = async (scanRequest) => {
    try {
        const url = scanRequest.url;
        const zapSpiderUrl = `http://localhost:8080/JSON/spider/action/scan/?url=${encodeURIComponent(url)}&apikey=${apiKey}`;
        const zapResponse = await axios.get(zapSpiderUrl);
        const scanId = zapResponse.data.scan;

        savedScanId = scanId;

        return true;
    }
    catch (error) {
        console.error('Error initiating spider scan:', error);
        isScanning = false;

        return null;
    }
}

// Get the scan progress for a given scan id. This is called multiple times to get the updated scan progress from zap
app.get('/progress', async (req, res) => {
    const scanId = req.query.scanId;
    const scanRequest = scanQueue[0];
    
    try {
        const statusResponse = await axios.get(`http://localhost:8080/JSON/spider/view/status/?scanId=${scanId}&apikey=${apiKey}`);

        // Get the status and convert it to integer
        const status = parseInt(statusResponse.data.status, 10);
        console.log(`Scan progress: ${status}%`);

        if (status < 100) {
            res.json({ status: status });
        }
        // Scan reached 100%, set isScanning to false to allow other scans to begin
        else {
            isScanning = false;
            res.json({ status: status });
        }
    } catch (error) {
        console.error('Error checking scan status:', error);
        isScanning = false;
    }
});

// Function to check the status of the spider scan and wait for completion
const checkScanStatus = async (scanRequest, scanId) => {
    try {
        const timeout = 20000; // Timeout after 20 seconds
        const interval = 2000; // Check status every 2 seconds
        let elapsedTime = 0; 

        while (elapsedTime < timeout) {
            const statusResponse = await axios.get(`http://localhost:8080/JSON/spider/view/status/?scanId=${scanId}&apikey=${apiKey}`);
            const scanStatus = parseInt(statusResponse.data.status, 10);
            console.log(`Scan progress in checkScanStatus: ${scanStatus}%`);

            if (scanStatus >= 100) {
                console.log("Scan completed");
                // sets this boolean to false to allow other scans to start
                isScanning = false
                return true;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
            elapsedTime += interval;
        }
        console.log('Scan timed out. Stopping the scan');
        await stopScan(scanId);
        return true;
    } catch (error) {
        console.error('Error checking scan status:', error);
        // sets this boolean to false to allow other scans to start
        isScanning = false;
        return false;
    }
};

// Update the scan results list
app.get('/updateScanResults', async (req, res) => {
    // Access the query parameters sent from frontend
    const scanId = req.query.scanId;
    const scanRequest = scanQueue[0];

    console.log('scan queue is: ', scanQueue);
    const sessionId = req.query.sessionId;

    // fetchScanResults will update the file for scanned results and return boolean
    console.log(`Fetching scan results now`);
    const result = await fetchScanResults(scanRequest, scanId, sessionId);
    if (result.success === true) {
        scanQueue.shift();
        res.status(200).json({ success: true, riskLevelsArray: result.riskLevelsArray });
    }
    else {
        res.status(500).json({ success: false, error: 'Error updating scan results' });
        console.log("Error updating scan results");
    }
})

app.get('/returnScanIDs', (req,res) => {
    const sessionId = req.query.sessionId;
    try {
        if (Object.keys(globalPluginIdsArray).length > 0) {
            res.json(getVulnerability(sessionId))
        }
        else {
            res.status(403).json({ error: 'Array is empty'})
        }
    } catch(error) {
        console.error(error)
    }
})

function getVulnerability(sessionId) {
    const vulnerabilityNames = [];
    const pluginIdsArray = globalPluginIdsArray[sessionId];
    pluginIdsArray.forEach(id => {
        for (let i = 0; i <= 161; i++) {
            if (vulnerabilityResultsPath[i].alertID == id){
                vulnerabilityNames.push([id,vulnerabilityResultsPath[i].alertName,vulnerabilityResultsPath[i].alertReferences,vulnerabilityResultsPath[i].alertRisk,vulnerabilityResultsPath[i].alertSummary,vulnerabilityResultsPath[i].alertSolution, new Date()])
                break;
            }
        }
    })
    return vulnerabilityNames;
}

// Get the scan results from zap for given scan id
const fetchScanResults = async (scanRequest, scanId, sessionId) => {
    try {
        console.log('scan request is: ', scanRequest);
        const userIP = scanRequest.ip;
        const url = scanRequest.url;

        // Get scan results from ZAP
        const resultsResponse = await axios.get(`http://localhost:8080/JSON/core/view/alerts/?baseurl=${encodeURIComponent(url)}&apikey=${apiKey}`);
        const fetchedAlerts = resultsResponse.data.alerts;
        const currentData = JSON.parse(fs.readFileSync(scanDataPath));

        returnInfo = {};
        populate_returnInfo(fetchedAlerts);

        // Create a Set to track unique alert identifiers (pluginId)
        const uniqueAlerts = new Set();

        // Filter out duplicate alerts based on 'pluginId'
        const results = fetchedAlerts.filter(alert => {
            const identifier = `${alert.pluginId}`;
            if (!uniqueAlerts.has(identifier)) {
                uniqueAlerts.add(identifier);
                // Unique, so keep this alert
                return true;
            }
            // Duplicate ID, so ignore
            return false;
        }).map(alert => ({
            pluginId: alert.pluginId,
        }));

        // Total number of vulnerabilities
        const totalIssues = results.length;
        let currentCount = 0;
        try {
            const currentCountStr = await fs.promises.readFile(counterFilePath, 'utf-8');
            currentCount = parseInt(currentCountStr, 10);
            if (isNaN(currentCount)) {
                currentCount = 0;
            }
            currentCount += totalIssues;
            await fs.writeFile(counterFilePath, currentCount.toString(), (err) => {
                if (err) {
                    console.error('Error updating counter:', err);
                } else {
                    console.log('Counter updated successfully');
                }
            });            
        } catch (error) {
            console.error('Error updating counter:', error);
        }

        await sendScanData(results);
        currentData.push({ userIP, url, scanId, results });
        await fs.promises.writeFile(scanDataPath, JSON.stringify(currentData, null, 2));

        const pluginIdsArray = results.map((idObject) => {
            return idObject.pluginId;
        })

        globalPluginIdsArray[sessionId] = pluginIdsArray;

        const vulnerabilities = getVulnerability(sessionId);
        const riskLevelsArray = {
            'Informational': 0,
            'Low': 0,
            'Medium': 0,
            'High': 0,
            'Undefined': 0
        };
        vulnerabilities.forEach((vulnerability) => {
            const type = vulnerability[3];
            switch (type) {
                case 'Informational':
                case 'Low':
                case 'Medium':
                case 'High':
                    riskLevelsArray[type]++;
                    break;
                default:
                    riskLevelsArray['Undefined']++;
                    break;
            }
        })

        // function returns true
        return {success: true, riskLevelsArray: riskLevelsArray};
    } catch (error) {
        console.error('Error fetching scan results:', error);

        // function returns false
        return {success: false};
    }
};

function populate_returnInfo(scanResults){
    scanResults.forEach(alert => {
        if (alert.pluginId in returnInfo){
            if (alert.confidence==="Medium")
                returnInfo[alert.pluginId].mediumConfidence.push(alert.url);
            if (alert.confidence==="High")
                returnInfo[alert.pluginId].highConfidence.push(alert.url);
            if (alert.confidence==="Low")
                returnInfo[alert.pluginId].lowConfidence.push(alert.url);
        }
        else{
            returnInfo[alert.pluginId] = {lowConfidence:[],mediumConfidence:[],highConfidence:[]}
            if (alert.confidence==="Medium")
                returnInfo[alert.pluginId].mediumConfidence.push(alert.url);
            if (alert.confidence==="High")
                returnInfo[alert.pluginId].highConfidence.push(alert.url);
            if (alert.confidence==="Low")
                returnInfo[alert.pluginId].lowConfidence.push(alert.url);
        }
    })
} 

// Function to stop the scan
const stopScan = async (scanId) => {
    try {
        const stopResponse = await axios.get(`http://localhost:8080/JSON/spider/action/stop/?scanId=${scanId}&apikey=${apiKey}`);
        console.log('Scan stopped successfully:', stopResponse.data);
        isScanning = false;

        res.status(200).json({ message: "true" });
    }
    catch (error) {
        console.error('Error stopping scan:', error);
        res.status(500).json({ error: error });
    }
}

app.get('/stopScan', async (req, res) => {
    const scanId = req.query.scanId;
    const stopReason = req.query.reason;

    stopReason !== 'timeout' && scanQueue.shift();

    console.log('scan queue is: ', scanQueue);
    try {
        const stopResponse = await axios.get(`http://localhost:8080/JSON/spider/action/stop/?scanId=${scanId}&apikey=${apiKey}`);
        console.log('Scan stopped successfully:', stopResponse.data);
        isScanning = false;

        res.status(200).json({ message: 'Scan stopped successfully' });
    }
    catch (error) {
        console.error('Error stopping scan:', error);
    }
})

app.get('/returnInfo', (req,res) =>{
    try{
        res.json(returnInfo);
    }catch(error){
        console.log(error);
    }
})

// Send the scan data to the user
const sendScanData = async (results) => {
    try {
        console.log("results from scan: ");
        results.forEach((result, index) => {
            console.log(`Result ${index + 1}:`, result); 
            // printing to console for now, work on sending to client
        });
    }
    catch (error) {
        console.error('Error sending scan results:', error);
    }
}

// Function to log the user's ip and timestamp
const validateUser = async (ip) => {
    try {
        const userData = JSON.parse(fs.readFileSync(userDataPath));

        // Generate server timestamp
        const currentTime = new Date();
        const timestamp = currentTime.toISOString().replace('T', ' ');

        // Check if the user's IP address already exists in the user data array
        const existingUserIndex = userData.findIndex(user => user.ip === ip);

        if (existingUserIndex !== -1) {
            // Check if any one of the three most recent timestamps is within 24 hours
            const recentTimestamps = userData[existingUserIndex].timestamps.slice(-3); // Get last three timestamps

            const countWithin24Hours = recentTimestamps.reduce((count, ts) => {
                const tsDate = new Date(ts);
                const timeDifference = currentTime - tsDate;
                if (timeDifference <= 24 * 60 * 60 * 1000 && // Check if timestamp is within 24 hours
                    tsDate.getFullYear() === currentTime.getFullYear() && // Check if year is the same
                    tsDate.getMonth() === currentTime.getMonth() && // Check if month is the same
                    tsDate.getDate() === currentTime.getDate()) { // Check if day is the same
                    count++;
                }
                return count;
            }, 0);

            if (countWithin24Hours < 3) {
                // Less than 3 scans performed in the past 24 hours
                console.log(`User with IP ${ip} has performed ${countWithin24Hours} scans in the past 24 hours, new scan permitted`);
                console.log(`Timestamp ${timestamp} logged in database.`);

                userData[existingUserIndex].timestamps.push(timestamp);
            } else {
                // 3 or more scans performed in the past 24 hours
                console.log(`User with IP ${ip} has already used the service 3 times in the past 24 hours.`);
                console.log(`Entry not logged in database.`);

                // sets this boolean to false to allow other scans to start
                isScanning = false;

                // Return false so current request is not fulfilled
                return false;
            }
        } else {
            // User does not exist, create new entry
            console.log(`User with IP ${ip}, Timestamp ${timestamp} logged in database.`);
            userData.push({ ip: ip, timestamps: [timestamp] });
        }
        // Write updated user data to file

        // COMMENTED FOR NOW!
        // await fs.promises.writeFile(userDataPath, JSON.stringify(userData, null, 2));
        return true;
    } catch (error) {
        console.error('Error with logging data:', error);
        // Return false in case of an error
        return false;
    }
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});