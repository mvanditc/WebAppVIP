// JavaScript used for the Homepage's Counter functionality.

let $scanTarget = document.getElementById('index-scanComponent-scan-target');
let $progressBar = document.getElementById('index-scanComponent-progressBar');
let $scanProgress = document.getElementById('index-scanComponent-progressBar-percentage');
let $viewDetailsButton = document.getElementById('index-scanComponent-view-details-container');
let $scanStatus = document.getElementById('index-scanComponent-scan-status');

let $informationalRisk = document.getElementById('index-scanComponent-informational-risk');
let $lowRisk = document.getElementById('index-scanComponent-low-risk');
let $mediumRisk = document.getElementById('index-scanComponent-medium-risk');
let $highRisk = document.getElementById('index-scanComponent-high-risk');
let $unclassifiedRisk = document.getElementById('index-scanComponent-undefined-risk');

let $timeElapsed = document.getElementById('index-scanComponent-time-elapsed');

let globalTerminationTime = 20; // scan time limit in seconds
let terminationTime = globalTerminationTime;
let statusCheckTimer = 1;
let scanTerminated = false;
let globalScanId = null;
let globalUrl = null;
let completedScans = JSON.parse(localStorage.getItem('COMPLETED_SCANS')) || [];

$informationalRisk.textContent = '-'
$lowRisk.textContent = '-';
$mediumRisk.textContent = '-';
$highRisk.textContent = '-';
$unclassifiedRisk.textContent = '-';
$scanProgress.textContent = '-';
$timeElapsed.textContent = '-';

$viewDetailsButton.style.display = 'none';

const $form = document.getElementById('index-data-form');
const $scanStatusError = document.getElementById('index-scan-status-error');
const $scanQueue = document.getElementById('index-scan-queue');

let scanQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];
checkScanQueueLength();

function checkScanQueueLength() {
  if (scanQueue.length > 1) {
    displayQueue(); 
    return false;
  }
  else {
    return true;
  }
}

window.addEventListener('storage', function (event) {
  if (event.key === 'SCAN_QUEUE') {
    scanQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];
  }
});

window.addEventListener('unload', function (event) {
  if (completedScans.length > 0)  {

    completedScans.forEach((scan) => {
      const scanTarget = scan['url'];
      const scanStatus = scan['status'];
      const vulnerabilities = scan['vulnerabilities'];
      const informationalRisk = vulnerabilities['informational'];
      const lowRisk = vulnerabilities['low'];
      const mediumRisk = vulnerabilities['medium'];
      const highRisk = vulnerabilities['high'];
      const unclassifiedRisk = vulnerabilities['unclassified'];

      $scanTarget.textContent = scanTarget;
      $scanStatus.textContent = scanStatus;
      $informationalRisk.textContent = informationalRisk;
      $lowRisk.textContent = lowRisk;
      $mediumRisk.textContent = mediumRisk;
      $highRisk.textContent = highRisk;
      $unclassifiedRisk.textContent = unclassifiedRisk;
    })
  }
});

$form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const $urlInput = document.getElementById('index-data-input');
  globalUrl = $urlInput.value.trim();
  $urlInput.value = '';

  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  const isValid = regex.test(globalUrl);
  
  if (isValid) {
    const withinLimit = await userWithinScanLimit(globalUrl);
    if (withinLimit) {
      scanQueue.push(globalUrl);
      localStorage.setItem('SCAN_QUEUE', JSON.stringify(scanQueue));

      const queueEmpty = checkScanQueueLength();
      if (queueEmpty) {
        sendUrlForScan();
      }
    }
    else {
      $scanStatusError.textContent = 'You have reached the limit of scans allowed in the past 24 hours.'
    }
  }
  else {
    alert('Please enter a valid url.');
  }
})

function displayQueue() {
  const tempQueue = scanQueue.slice(1);
  $scanQueue.textContent = 'Scans in Queue:';
  $scanQueue.appendChild(document.createElement('p'));

  tempQueue.forEach((url) => {
    const $scanDiv = document.createElement('div');
    const $scanUrl = document.createElement('p');
    const $cancelButton = document.createElement('button');
    $cancelButton.textContent = 'Cancel Scan';

    $scanUrl.textContent = url;
    
    $scanDiv.appendChild($scanUrl);
    $scanDiv.appendChild($cancelButton);

    const scanDivStyles = {
      display: 'flex',
      flexDirection: 'row',
      height: '30px',
      alignItems: 'center',
      justifyContent: 'flex-start'
    }

    Object.assign($scanDiv.style, scanDivStyles);

    $cancelButton.addEventListener('click', () => {
      const urlIndex = scanQueue.indexOf(url);
      if (urlIndex !== -1) {
        scanQueue.splice(urlIndex, 1);
      }

      localStorage.setItem('SCAN_QUEUE', JSON.stringify(scanQueue));

      $scanDiv.remove();
      scanQueue.length <= 1 && $scanQueue.remove();
    })
    
    $scanQueue.appendChild($scanDiv);
  })
}

async function userWithinScanLimit(inputUrl) {
  try {
    // post request format
    const response = await fetch('http://localhost:8800/addScanToQueue', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl }),
    });
    
    if (response.status === 200) {
      return true;
    }
    else if (response.status === 403) {
        return false;
    }
  } catch (error) {
      console.error('Error Submitting:', error);
  }
}

// window.addEventListener('pageshow', function (event) {
//   if (!event.persisted) {
//       sendUrlForScan();
//   }
// });

// window.addEventListener("popstate", function (e) {
//   location.reload();
// });

//   window.addEventListener('beforeunload', function (e) {
//     var confirmationMessage = 'Are you sure you want to leave?';
//     e.returnValue = confirmationMessage;

//     return confirmationMessage;
//   });

window.addEventListener('unload', function () {
  terminateScan({scanId: globalScanId, reason: 'userAction'});
  scanTerminated = true;
});

$scanTarget.addEventListener('click', () => {
  window.open(globalUrl, '_blank');
})

async function sendUrlForScan() {
  try {
    const response = await fetch('http://localhost:8800/submit');
    const result = await response.json();
    
    if (response.status === 200) {
      $scanTarget.textContent = globalUrl;
      const scanId = result.scanId;

      // Once the scan id is received, set the global variable to track this so we can use it in other function
      globalScanId = scanId;

      terminationTime = globalTerminationTime;
      scanTerminated = false;

      $timeElapsed.textContent = getFormattedTimeElapsed(terminationTime);
      
      const timerInterval = setInterval(() => {
          terminationTime--;
          $timeElapsed.textContent = getFormattedTimeElapsed(terminationTime);

          if (terminationTime <= 0) {
              scanTerminated = true;
              $timeElapsed.textContent = `Exceeded scan time limit. Fetching results...`;

              clearInterval(timerInterval); 
              terminateScan({scanId: scanId, reason: 'timeout'});
          }
      }, 1000)

      const scanningSpan = document.createElement('span');
      scanningSpan.textContent = 'Scanning...';
      scanningSpan.style.color = 'rgb(71, 182, 255)';
      $scanStatus.textContent = 'Scan Status: ';
      $scanStatus.appendChild(scanningSpan);

      // Get the progress from fetchScanProgress function
      const progressData = await fetchScanProgress(scanId);

      if (progressData !== null) {
          // update scan progress on page
          const scanUpdated = await updateScanProgress(progressData, scanId);
          if (scanUpdated) {
              clearInterval(timerInterval); 
              $timeElapsed.textContent = 'Successfully completed scan within time limit. Fetching results...';
          }
      }
      else {
          console.log("Error fetching scan progress");
      }
    }
    else {
      console.log('Received response status 403 in submit http request');
    }
  } catch (error) {
      console.log("Error in sending url for scan: ", error);
  }
}

// Convert seconds to minutes:seconds format
  function getFormattedTimeElapsed(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
      return formattedTime;
  }

 // Get scan results stored in local file
 async function getScanResultsFromFile() {
  try {
      const response = await fetch('http://localhost:8800/data');
      const scans = await response.json();

      return scans;
  } catch (error) {
      console.error('Error fetching data:', error);
      return null;
  }
}

async function terminateScan({ scanId, reason }) {
    if (globalScanId !== null && !scanTerminated) {
      try {
          const params = new URLSearchParams({ scanId });
          const response = await fetch(`http://localhost:8800/stopScan/?${params}`);
  
          if (response.status === 200) {
              reason === 'timeout' && fetchScanResults(scanId);
  
              updateScanQueue();
          }
      } catch (error) {
          console.log("Error terminating scan: ", error);
          updateScanQueue();
      }
  }
}

function updateScanQueue() {
  const savedQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];
  if (savedQueue.length > 0) {
      savedQueue.shift();
      localStorage.setItem('SCAN_QUEUE', JSON.stringify(savedQueue));
  }
}

// Function to update scan progress that is seen on the page
async function updateScanProgress(progressData, scanId) {
  if (!scanTerminated) {
      const maxChars = 15;
      const filledCharsCount = Math.round((progressData.status / 100) * maxChars);
      const filledChars = '█'.repeat(filledCharsCount);
      const dashChars = '--'.repeat(maxChars - filledCharsCount);

      $progressBar.textContent = `[ ${filledChars}${dashChars} ]`;

      $scanProgress.textContent = `${progressData.status}%`;
      console.log(`Scan Progress: ${progressData.status}%`);

      // If scan has not yet reached 100%, then fetch scan progress which calls the zap API and gets the progress data
      if (progressData.status < 100) {
          await new Promise(resolve => setTimeout(resolve, statusCheckTimer * 1000));
  
          const progress = await fetchScanProgress(scanId);
          if (progress !== null) {
              // Update scan progress every 1 second on the page
              return await updateScanProgress(progress, scanId);
          }
      } else if (progressData.status === 100) {
          fetchScanResults(scanId);
          return true;
      }
  }
  else {
      fetchScanResults(scanId);
  }
}

// Function to get scan progress from backend
async function fetchScanProgress(scanId) {
  try {
      const params = new URLSearchParams({ scanId })
      const progressResponse = await fetch(`http://localhost:8800/progress/?${params}`);
      const progressData = await progressResponse.json();

      return progressData;
  } catch (error) {
      console.error('Error checking scan progress:', error);
      return null;
  }
}

async function fetchScanResults(scanId) {
  // Update the scan results list after scan is completed
  const params = new URLSearchParams({ scanId, globalUrl })
  const response = await fetch(`http://localhost:8800/updateScanResults/?${params}`);
  const result = await response.json();

  if (response.status === 200) {
      const scanData = await getScanResultsFromFile();
      if (scanData !== null) {
          // updateScanResultsList(scanData);
          
          $scanProgress.textContent = '-';
          $timeElapsed.textContent = '-'; 

          const riskLevelsArray = result['riskLevelsArray'];
          
          const informationalRisk = riskLevelsArray['Informational'];
          const lowRisk = riskLevelsArray['Low'];
          const mediumRisk = riskLevelsArray['Medium'];
          const highRisk = riskLevelsArray['High'];
          const unclassifiedRisk = riskLevelsArray['Undefined'];

          $informationalRisk.textContent = informationalRisk;
          $lowRisk.textContent = lowRisk;
          $mediumRisk.textContent = mediumRisk;
          $highRisk.textContent = highRisk;
          $unclassifiedRisk.textContent = unclassifiedRisk;

          $viewDetailsButton.style.display = 'block'

          const completeSpan = document.createElement('span');
          completeSpan.textContent = 'Complete';
          completeSpan.style.color = 'rgb(0, 255, 0)';
          $scanStatus.textContent = 'Scan Status: ';
          $scanStatus.appendChild(completeSpan);

          scanTerminated = true;
          updateCompletedScans({ informationalRisk, lowRisk, mediumRisk, highRisk, unclassifiedRisk });
          updateScanQueue();
      }
      else {
          console.log("Error fetching scan data, fetch returned null");
      }
  }
}

function updateCompletedScans({ informationalRisk, lowRisk, mediumRisk, highRisk, unclassifiedRisk }) {
  const savedCompletedScans = JSON.parse(localStorage.getItem('COMPLETED_SCANS')) || [];

  if (savedCompletedScans.length > 0) {
    const maxId = Math.max(...savedCompletedScans.map(obj => obj.id));

    const completedScan = {
      id: maxId + 1,
      url: globalUrl,
      status: 'Complete',
      vulnerabilities: {
        informational: informationalRisk,
        low: lowRisk,
        medium: mediumRisk,
        high: highRisk,
        unclassified: unclassifiedRisk
      }
    }

    savedCompletedScans.push(completedScan);
  } else {
    const completedScan = {
      id: 1,
      url: globalUrl,
      status: 'Complete',
      vulnerabilities: {
        informational: informationalRisk,
        low: lowRisk,
        medium: mediumRisk,
        high: highRisk,
        unclassified: unclassifiedRisk
      }
    }
    savedCompletedScans.push(completedScan);
  }

  localStorage.setItem('COMPLETED_SCANS', JSON.stringify(savedCompletedScans));
}

/*

Note: This code is used to update the history of scans the user has done. It saves the issues that were recorded
so the user can see them again if they want to see the results for a previous scan they did.
Currently commented, see if we want to save previous scans and proceed if we do.

// Update the scan results list on the frontend
function updateScanResultsList(scans) {
  // Clear previous data
  $dataList.textContent = '';
  
  // Process and display each scan
  scans.forEach(scan => {
      // Display only URL and total number of issues
      $dataList.textContent += `<li>${scan.url} - Total Issues: ${scan.results.length}</li>`;
  });
}

// Get the scan results list every time the page loads, this is shown on the page
const scanData = await getScanResultsFromFile();
if (scanData !== null) {
    updateScanResultsList(scanData);
}
else {
    console.log("Error fetching scan data, fetch returned null");
}
*/