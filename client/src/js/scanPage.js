let storedScanID = sessionStorage.getItem('scanid');
let storedScanHash = sessionStorage.getItem('scanhash');

let progressCheckingClockNeeded = false

let processClockNeeded = false

let scanDetailsButton = document.getElementById("scanDetailsButton")
let scanPrecentageValue = document.getElementById("scanPage-progressBar-percentage-value")
let copiedToClipBoardNotification = document.getElementById("copiedToClipBoardNotification")
let scanStatusText = document.getElementById("scanPage-scan-status")
let scanTimeElapsedText = document.getElementById("scanPage-time-elapsed-text")
let scanTimeLimitText = document.getElementById("scanPage-time-limit-text")
let scanTimeLimitMessageText = document.getElementById("scanPage-time-limit-message")
let viewDetailsButton = document.getElementById("scanDetailsButton");

let highRiskAmountText = document.getElementById("scanPage-high-risk")
let moderateRiskAmountText = document.getElementById("scanPage-medium-risk")
let lowRiskAmountText = document.getElementById("scanPage-low-risk")
let informationalRiskAmountText = document.getElementById("scanPage-informational-risk")
let unclassifiedRiskAmountText = document.getElementById("scanPage-unclassified-risk")

let backToHomeArrow = document.getElementById("backToHomeArrow")

let progressBarBlocks = document.querySelectorAll(".progress-bar-block")

console.log(progressBarBlocks)

let scanTargetURL = document.getElementById("scanPage-scan-target")

let scanResultsData = {}

let waitingForScanToFinish = true

var scanFinishedResponseReceived = false
var scanFinishedRequestSent = false

var currentlyPreparingResults = false

var currentScanTime = 0

var timeLimit = -1

function cancelScan(){
    console.log("Cancelling Scan")
    fetch("http://localhost:3030/cancel-scan", {
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

    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

function prepareScanResultsViewing(){
    console.log("click recieved")
}

function secondsToMinutesAndSeconds(seconds){
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    var formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return minutes + ":" + formattedSeconds;
}

async function preparingResultsTextMovingFunction(){
    if (currentlyPreparingResults){
        return
    }
    else{
        currentlyPreparingResults = true
        while (waitingForScanToFinish){
            if (!waitingForScanToFinish){
                break
            }
            scanStatusText.innerHTML = "Preparing Results"
            await delay(500)
            if (!waitingForScanToFinish){
                break
            }
            scanStatusText.innerHTML = "Preparing Results."
            await delay(500)
            if (!waitingForScanToFinish){
                break
            }
            scanStatusText.innerHTML = "Preparing Results.."
            await delay(500)
            if (!waitingForScanToFinish){
                break
            }
            scanStatusText.innerHTML = "Preparing Results..."
            await delay(500)
        }
        if (waitingForScanToFinish == false){
            scanStatusText.innerHTML = "Scan Finished"
        }
    }
    currentlyPreparingResults = false
}

async function hideCopyToClipboardNotification(){
    await delay(2000)
    copiedToClipBoardNotification.style.opacity = "0"
}
scanTargetURL.addEventListener("click", ()=>{
    copiedToClipBoardNotification.style.opacity = "1"
    hideCopyToClipboardNotification()

    // Get the text from the paragraph element
    var urlToCopy = scanTargetURL.innerText;
    
    // Copy the selected text to the clipboard
    navigator.clipboard.writeText(urlToCopy)
    .then(function() {
      console.log('Text copied to clipboard: ' + urlToCopy);
    })
    .catch(function(err) {
      console.error('Could not copy text: ', err);
    });
})

function updateProgressValues(scanPercentString, timeElapsed, timeLimit){
    console.log(scanPercentString)
    console.log(typeof scanPercentString)
    console.log(timeElapsed)
    console.log(typeof timeElapsed)
    console.log(isNaN(timeElapsed))
    let scanPercentInt = (parseInt(scanPercentString))/100

    if(isNaN(timeElapsed)){
        console.log("timeLimit")
        console.log(timeLimit)
        timeElapsed = timeLimit
    }
    if(typeof scanPercentInt == "undefined"){
        scanPercentInt = 1
        scanPrecentageValue.innerHTML = "100%"
    }else{
        scanPrecentageValue.innerHTML = scanPercentString + "%"
    }

    scanTimeElapsedText.innerHTML = "Time Elapsed: " + secondsToMinutesAndSeconds(timeElapsed)

    let numberOfBlocks = Math.floor(scanPercentInt * 25);

    console.log(numberOfBlocks)


    for (var i = 0; i < progressBarBlocks.length; i++) {
        try{
            if ((i + 1)<=numberOfBlocks){
                progressBarBlocks[i].style.opacity = 1;
            }else{
                progressBarBlocks[i].style.opacity = 0;
            }
        }catch{
            continue
        }
    }

}

async function waitForScanToFinish(){
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
        preparingResultsTextMovingFunction()
        console.log('Waiting for Scan to Finish:', data);
        scanResultsData = data
        if (scanResultsData["status"] == "success"){
            waitingForScanToFinish = false
            scanStatusText.innerHTML = "Scan Finished"
            let alertSummaryData = scanResultsData['alertSummary']['alertsSummary']
            highRiskAmountText.innerText = alertSummaryData['High'];
            moderateRiskAmountText.innerText = alertSummaryData['Medium'];
            lowRiskAmountText.innerText = alertSummaryData['Low'];
            informationalRiskAmountText.innerText = alertSummaryData['Informational'];
            unclassifiedRiskAmountText.innerText = "0";
            viewDetailsButton.style.opacity = "1"
            viewDetailsButton.disabled = false
        }
        scanFinishedRequestSent = false
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

async function checkScanProgress(){
    await fetch("http://localhost:3030/get-scan-progress", {
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
        currentScanTime = parseInt(scanResultsData['timeElapsed'])
        if (scanResultsData['status'] == "success"){
            updateProgressValues(scanResultsData['scanProgress'], parseInt(scanResultsData['timeElapsed']), scanResultsData['timeLimit'])
            let alertSummaryData = scanResultsData['alertSummary']['alertsSummary']
            highRiskAmountText.innerText = alertSummaryData['High'];
            moderateRiskAmountText.innerText = alertSummaryData['Medium'];
            lowRiskAmountText.innerText = alertSummaryData['Low'];
            informationalRiskAmountText.innerText = alertSummaryData['Informational'];
            unclassifiedRiskAmountText.innerText = "0";
            scanTargetURL.innerText = scanResultsData['currentScanTargetURL']
            scanStatusText.innerHTML = "Scanning"
            if (scanResultsData['scanProgress'] == "100"){
                progressCheckingClockNeeded = false
                scanWaitingToFinishClock()
            }else if ((scanResultsData['timeElapsed'] / parseInt(scanResultsData['timeLimit'])) >= 1){
                progressCheckingClockNeeded = false
                scanWaitingToFinishClock()
            }
            if((scanResultsData['timeElapsed'] / parseInt(scanResultsData['timeLimit'])) >= 1){
                scanStatusText.innerHTML = "Time Limit Exceeded"
                scanTimeLimitMessageText.innerHTML = "Time limit exceeded, results incomplete..."
            }
        }else if(scanResultsData['status'] == "waiting for finish"){
            preparingResultsTextMovingFunction()
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
        await checkScanProgress()
        await delay(1000);
    }
    return
}


async function scanTimeElapsedClock() {
    scanStatusText.innerHTML = "Scanning"
    while (true) {
        if (currentlyPreparingResults == true){
            break
        }
        if (timeLimit != -1){
            await delay(1000);
            currentScanTime += 1
            scanTimeElapsedText.innerHTML = "Time Elapsed: " + secondsToMinutesAndSeconds(currentScanTime)

            if((currentScanTime / timeLimit) >= 1){
                scanStatusText.innerHTML = "Scan Stopped"
                scanTimeLimitMessageText.innerHTML = "Time limit exceeded, results incomplete..."
                await delay(2000);
                preparingResultsTextMovingFunction()
                break
            }
        }
    }
    
}

async function scanProcessingClock() {
    scanStatusText.innerHTML = "Processing"
    processClockNeeded = true
    while (processClockNeeded) {
        console.log("Trying to Process Scan")
        await processScan()
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
    scanStatusText.innerHTML = "Attempting Scan"
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
            scanStatusText.innerHTML = "Scan Started"
            timeLimit = data['timeLimit']

            scanTimeLimitText.innerHTML = "Time Limit: " + secondsToMinutesAndSeconds(timeLimit)
            scanTimeElapsedClock()
            scanProgressCheckingClock()
        }
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

async function processScan(){
    await fetch("http://localhost:3030/process-queued-scan-if-next", {
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
        }else{
            alert("Your queue position was invalid...")
            window.location.href = '../../public/html/accessDenied.html';
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

viewDetailsButton.addEventListener("click", prepareScanResultsViewing)

backToHomeArrow.addEventListener("click", ()=>{
    cancelScan()
    sessionStorage.removeItem('scanid');
    sessionStorage.removeItem('scanhash');

    window.location.href = '../../public/html/index.html';
})