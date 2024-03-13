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

let issueSectionContainer = document.getElementById("issueSectionContainer")

let filterSelect = document.getElementById("filterSelect")

let highRiskAmountText = document.getElementById("scanPage-high-risk")
let moderateRiskAmountText = document.getElementById("scanPage-medium-risk")
let lowRiskAmountText = document.getElementById("scanPage-low-risk")
let informationalRiskAmountText = document.getElementById("scanPage-informational-risk")
let unclassifiedRiskAmountText = document.getElementById("scanPage-unclassified-risk")

let backToHomeArrow = document.getElementById("backToHomeArrow")

let scanDetailsSectionContainer = document.getElementById("scanDetailsSectionContainer")

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

function handleCopyButtonForConfidenceLevelJSON(button){
    let selectedAlertRef = button.getAttribute('value');

    let confidenceLevelsData = scanResultsData["confidenceLevelsData"]

    // Copy the selected text to the clipboard
    navigator.clipboard.writeText(JSON.stringify(confidenceLevelsData[selectedAlertRef], null, 2))
    .then(function() {
      console.log('Text copied to clipboard: ' + selectedAlertRef);
    })
    .catch(function(err) {
      console.error('Could not copy text: ', err);
    });
}

function sortDetails(){
    // Select the parent div
    const sortContainer = document.getElementById('issueSectionContainer');

    // Get all child divs and convert them into an array
    const divs = Array.from(sortContainer.children);

    // Sort the array of divs based on their value attribute
    divs.sort((a, b) => {
    const valueA = a.getAttribute('value');
    const valueB = b.getAttribute('value');
    
    // Use localeCompare for string comparison (High > Medium > Low > Informational)
    return valueA.localeCompare(valueB);
    });

    // Remove existing divs from the container
    while (sortContainer.firstChild) {
    sortContainer.removeChild(sortContainer.firstChild);
    }

    // Append sorted divs back to the container
    divs.forEach(div => sortContainer.appendChild(div));
}

function filterDetails(){
    // Select the parent div
    const sortContainer = document.getElementById('issueSectionContainer');

    // Get all child divs and convert them into an array
    const divs = Array.from(sortContainer.children);

    let selectedFilter = filterSelect.value

    let selectedRiskLevel = "-1"
    switch(selectedFilter) {
        case "all":
            selectedRiskLevel="0"
            break;
        case "high":
            selectedRiskLevel="1"
            break;
        case "medium":
            selectedRiskLevel="2"
            break;
        case "low":
            selectedRiskLevel="3"
            break;
        case "informational":
            selectedRiskLevel="4"
            break;
    }


    console.log(selectedFilter)
    console.log(selectedRiskLevel)

    if (selectedRiskLevel != "0"){
        divs.forEach(div => {
            if (div.getAttribute('value') != selectedRiskLevel){
                div.style.display = "none"
            }else{
                div.style.display = ""
            }
        });
    }else{
        divs.forEach(div => {
            div.style.display = ""
        });
    }
}

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
    scanDetailsSectionContainer.style.display = "flex"
    viewDetailsButton.style.opacity = "0"
    viewDetailsButton.disabled = true
    viewDetailsButton.style.cursor = "default"

    let scanAlertsSummary = scanResultsData["alertSummary"]["alertsSummary"]
    let scanAlertsSummaryTotal = scanAlertsSummary["High"] + scanAlertsSummary["Low"] + scanAlertsSummary["Medium"] + scanAlertsSummary["Informational"]
    filterSelect.innerHTML = `
    <option value='all'>All (${scanAlertsSummaryTotal})</option>
    <option value='high'>High (${scanAlertsSummary["High"]})</option>
    <option value='medium'>Medium (${scanAlertsSummary["Medium"]})</option>
    <option value='low'>Low (${scanAlertsSummary["Low"]})</option>
    <option value='informational'>Informational (${scanAlertsSummary["Informational"]})</option>
    `

    let scanAlertsSectionInnerHTML = ``

    let uniqueScanAlertsListArray = scanResultsData["uniqueScanAlerts"]

    let confidenceLevelsData = scanResultsData["confidenceLevelsData"]

    let alertTitleWithCircle = ""
    let alertRiskTextWithColor = ""
    let alertConfidenceLevelTextWithColor = ""
    let alertTagsInnerHTML = ``
    let alertReferencesInnerHTML = ``

    for (var i = 0; i < uniqueScanAlertsListArray.length; i++) {
        let currentRiskLevel = 0

        // Get Alert Title Span (Circle Icon)
        // Set Risk Level to Proper Color
        alertTitleWithCircle = ""
        alertRiskTextWithColor = ""
        switch(uniqueScanAlertsListArray[i]["alertData"]["risk"]) {
            case "High":
                alertTitleWithCircle = `<i class="fa-solid fa-circle view-details-high-risk"></i> ${uniqueScanAlertsListArray[i]["alertData"]["name"]}`;
                alertRiskTextWithColor = `Alert Risk: <div class="view-details-high-risk">High</div>`;
                currentRiskLevel=1
                break;
            case "Medium":
                alertTitleWithCircle = `<i class="fa-solid fa-circle view-details-med-risk"></i> ${uniqueScanAlertsListArray[i]["alertData"]["name"]}`;
                alertRiskTextWithColor = `Alert Risk: <div class="view-details-med-risk">Medium</div>`;
                currentRiskLevel=2
                break;
            case "Low":
                alertTitleWithCircle = `<i class="fa-solid fa-circle view-details-low-risk"></i> ${uniqueScanAlertsListArray[i]["alertData"]["name"]}`;
                alertRiskTextWithColor = `Alert Risk: <div class="view-details-low-risk">Low</div>`;
                currentRiskLevel=3
                break;
            case "Informational":
                alertTitleWithCircle = `<i class="fa-solid fa-circle view-details-info-risk"></i> ${uniqueScanAlertsListArray[i]["alertData"]["name"]}`;
                alertRiskTextWithColor = `Alert Risk: <div class="view-details-info-risk">Informational</div>`;
                currentRiskLevel=4
                break;
        }

        // Get Tags Inner HTML
        let alertTagsInnerHTML = ``
        for (let tagTitle in uniqueScanAlertsListArray[i]["alertData"]["tags"]) {
            let tagValue = uniqueScanAlertsListArray[i]["alertData"]["tags"][tagTitle];
            alertTagsInnerHTML += `<div class="view-details-tag"><a href="${tagValue}" target="_blank">${tagTitle}</a></div>`
        }

        //Get References Inner HTML
        let alertReferencesInnerHTML = ``
        let alertReferencesArray = []
        let alertReferencesString = uniqueScanAlertsListArray[i]["alertData"]["reference"].replace(/\n/g, '');

        alertReferencesArray = alertReferencesString.split(/https?:\/\//);
        for (let reference in alertReferencesArray) {
            if(alertReferencesArray[reference] == ""){
                continue
            }
            alertReferencesInnerHTML += `<div class="view-details-reference"><a href="https://${alertReferencesArray[reference]}" target="_blank">https://${alertReferencesArray[reference]}</a></div>`
        }

        // Organize Confidence Levels
        let currentHighConfidenceLinks = confidenceLevelsData[uniqueScanAlertsListArray[i]["alertData"]["alertRef"]]["highConfidence"]
        let currentMediumConfidenceLinks = confidenceLevelsData[uniqueScanAlertsListArray[i]["alertData"]["alertRef"]]["mediumConfidence"]
        let currentLowConfidenceLinks = confidenceLevelsData[uniqueScanAlertsListArray[i]["alertData"]["alertRef"]]["lowConfidence"]
        let highConfidenceLinksInnerHTML = ""
        let mediumConfidenceLinksInnerHTML = ""
        let lowConfidenceLinksInnerHTML = ""

        currentHighConfidenceLinks.forEach(highConfidenceLink => {
            highConfidenceLinksInnerHTML += `<div>${highConfidenceLink}</div>`
        });
        currentMediumConfidenceLinks.forEach(highConfidenceLink => {
            mediumConfidenceLinksInnerHTML += `<div>${highConfidenceLink}</div>`
        });
        currentLowConfidenceLinks.forEach(highConfidenceLink => {
            lowConfidenceLinksInnerHTML += `<div>${highConfidenceLink}</div>`
        });

        let otherInfo = uniqueScanAlertsListArray[i]["alertData"]["other"]
        if (alertTagsInnerHTML == ""){
            alertTagsInnerHTML = "N/A"
        }
        if (alertReferencesInnerHTML == ""){
            alertReferencesInnerHTML = "N/A"
        }
        if (otherInfo == ""){
            otherInfo = "N/A"
        }
        let newSectionInnerHTML = `
        <div class="view-details-issue-container" value="${currentRiskLevel}">
            <div class="view-details-issue-title">${alertTitleWithCircle}</div>
            <div class="view-details-issue-subtitles">
                <div class="view-details-issue-subtitle">Alert Reference ID: <div class="alert-reference-id">${uniqueScanAlertsListArray[i]["alertData"]["alertRef"]}</div></div>
                <div class="view-details-issue-subtitle"><a href="../../public/html/vulnerabilityDictPage.html#${uniqueScanAlertsListArray[i]["alertData"]["alertRef"]}" target="_blank">Link to Dictionary</a></div>
                <div class="view-details-issue-subtitle">${alertRiskTextWithColor}</div>
            </div>
            <div class="view-details-issue-details-container">
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">Description</div>
                    <div class="view-details-issue-detail-content">${uniqueScanAlertsListArray[i]["alertData"]["description"]}</div>
                </div>
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">Actionable Steps</div>
                    <div class="view-details-issue-detail-content">${uniqueScanAlertsListArray[i]["alertData"]["solution"]}</div>
                </div>
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">Tags</div>
                    <div class="view-details-issue-detail-content">
                        ${alertTagsInnerHTML}
                    </div>
                </div>
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">Reference</div>
                    <div class="view-details-issue-detail-content">
                        ${alertReferencesInnerHTML}
                    </div>
                </div>
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">Other Information</div>
                    <div class="view-details-issue-detail-content">${otherInfo}</div>
                </div>
                <button class="copy-confidence-level-links-button" value="${uniqueScanAlertsListArray[i]["alertData"]["alertRef"]}">Copy Confidence Level Links JSON</button>
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">High Confidence Links:</div>
                    <div class="view-details-issue-confidence-links-container">${highConfidenceLinksInnerHTML}</div>
                </div>
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">Medium Confidence Links:</div>
                    <div class="view-details-issue-confidence-links-container">${mediumConfidenceLinksInnerHTML}</div>
                </div>
                <div class="view-details-issue-detail">
                    <div class="view-details-issue-detail-title">Low Confidence Links:</div>
                    <div class="view-details-issue-confidence-links-container">${lowConfidenceLinksInnerHTML}</div>
                </div>
            </div>
        </div>
        `

        scanAlertsSectionInnerHTML += newSectionInnerHTML
        if ((i%5) == 0){
            issueSectionContainer.innerHTML += scanAlertsSectionInnerHTML
            scanAlertsSectionInnerHTML = ""
            console.log(i)
        }
    }
    issueSectionContainer.innerHTML += scanAlertsSectionInnerHTML

    sortDetails();

    let copyConfidenceLevelLinksButtons = document.querySelectorAll(".copy-confidence-level-links-button")
    copyConfidenceLevelLinksButtons.forEach(button => {
        button.addEventListener('click', ()=>{
            handleCopyButtonForConfidenceLevelJSON(button)
        });
    });
    
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
            viewDetailsButton.style.cursor = "pointer"
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

filterSelect.addEventListener("input", filterDetails)

backToHomeArrow.addEventListener("click", ()=>{
    cancelScan()
    sessionStorage.removeItem('scanid');
    sessionStorage.removeItem('scanhash');

    window.location.href = '../../public/html/index.html';
})