let storedScanID = sessionStorage.getItem('scanid');
let storedScanHash = sessionStorage.getItem('scanhash');

let progressCheckingClockNeeded = false

let processClockNeeded = false

let scanDetailsButton = document.getElementById("scanDetailsButton")

let scanResultsData = {}

let waitingForScanToFinish = true

var scanFinishedResponseReceived = false
var scanFinishedRequestSent = false

async function waitForScanToFinish(){
    //scanDetailsButton.addEventListener("click", prepareScanResultsViewing)

    if (scanFinishedRequestSent == true){
        return
    }else{
        scanFinishedRequestSent = true
        console.log("waitForScanToFinish")
    }
    await fetch("http://localhost:3030/wait-for-scan-to-finish", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "scanid": storedScanID,
            "hash": storedScanHash
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        return response.json();
    })
    .then(data => {
        console.log('Waiting for Scan to Finish:', data);
        scanResultsData = data
        if (scanResultsData["status"] == "success"){
            waitingForScanToFinish = false
        }
        scanFinishedRequestSent = false
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

function checkScanProgress(){
    fetch("http://localhost:3030/get-scan-progress", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "scanid": storedScanID,
            "hash": storedScanHash
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        return response.json();
    })
    .then(data => {
        console.log('Scan Progress:', data);
        scanResultsData = data
        if (scanResultsData['status'] == "success"){
            if (scanResultsData['scanProgress'] == "100"){
                progressCheckingClockNeeded = false
                scanWaitingToFinishClock()
            }else if ((scanResultsData['timeElapsed'] / parseInt(scanResultsData['timeLimit'])) >= 1){
                progressCheckingClockNeeded = false
                scanWaitingToFinishClock()
            }
        }else if(scanResultsData['status'] == "waiting for finish"){
            console.log(`scanResultsData['status'] == "waiting to finish"`)
            progressCheckingClockNeeded = false
            scanWaitingToFinishClock()
        }else{
            progressCheckingClockNeeded = false
        }
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

async function scanProgressCheckingClock() {
    progressCheckingClockNeeded = true
    while (progressCheckingClockNeeded) {
        console.log("Getting Scan Progress")
        checkScanProgress()
        await delay(1000);
    }
    return
}

async function scanProcessingClock() {
    processClockNeeded = true
    while (processClockNeeded) {
        console.log("Trying to Process Scan")
        processScan()
        await delay(1000);
    }
    return
}

async function scanWaitingToFinishClock() {
    waitingForScanToFinish = true
    while (waitingForScanToFinish) {
        console.log("Waiting for Scan to Finish")
        if (scanFinishedRequestSent == false){
            waitForScanToFinish()
        }
        await delay(3000);
    }
    return
}
  
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function attemptScan(){
    fetch("http://localhost:3030/attempt-scan", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "scanid": storedScanID,
            "hash": storedScanHash
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        return response.json();
    })
    .then(data => {
        console.log('Scan Attempted:', data);
        if (data['status'] == "success"){
            scanProgressCheckingClock()
        }
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

function processScan(){
    fetch("http://localhost:3030/process-queued-scan-if-next", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "scanid": storedScanID,
            "hash": storedScanHash
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        return response.json();
    })
    .then(data => {
        console.log('Queue Item Processed:', data);
        if (data['status'] == "success"){
            processClockNeeded = false
            attemptScan()
            return
        }
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

document.addEventListener('DOMContentLoaded', ()=>{
    if (storedScanID == null || storedScanHash == null){
        window.location.href = '../../public/html/accessDenied.html';
        return
    }else{
        processClockNeeded = true
        scanProcessingClock()
        return
    }
})