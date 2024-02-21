// JavaScript used for the Scanning Page's functionality.

document.addEventListener('DOMContentLoaded', async () => {
  const $scanProgress = document.getElementById('scanProgress');
  const $scanTarget = document.getElementById('scanPage-scan-target');
  const $timeLimit = document.getElementById('timeLimit');

  let globalTerminationTime = 10;
  let terminationTime = globalTerminationTime;
  let statusCheckTimer = 1;
  let scanTerminated = false;
  let globalScanId = null;

  $scanProgress.innerHTML = 'Scan Progress: ---';
  $timeLimit.innerHTML = 'Time Limit: ---';
  
  window.addEventListener('beforeunload', function (e) {
    var confirmationMessage = 'Are you sure you want to leave?';
    e.returnValue = confirmationMessage;

    return confirmationMessage;
  });

  window.addEventListener('unload', function () {
    terminateScan(globalScanId);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const inputUrl = urlParams.get('url');
  await addScanRequestToQueue(inputUrl);
  

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

  // Send the url to be scanned to the backend and get the scan id if successful
  async function addScanRequestToQueue(data) {
    try {
        // post request format
        const response = await fetch('http://localhost:8800/addScanToQueue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: data }),
        });

        const result = await response.json();
        
        if (response.status === 200) {
            const url = result.url;
            scanQueue.push(url);

            const tempQueue = scanQueue.slice(1);
            $scanQueueOld.innerHTML = `Queue: ${tempQueue}`;
            $scanQueue.innerHTML = tempQueue;

            sendUrlForScan();
        }
        else if (response.status === 403) {
            $scanStatus.innerHTML = 'You have reached the limit of scans allowed in the past 24 hours.'
        }
    } catch (error) {
        console.error('Error Submitting:', error);
    }
  }

  async function sendUrlForScan() {
    $currentScan.innerHTML = `Scanning: ${scanQueue[0]}`;
    $scanTarget.innerHTML = scanQueue[0];

    try {
        const response = await fetch('http://localhost:8800/submit');
        const result = await response.json();

        if (response.status === 200) {
            const scanId = result.scanId;

            // Once the scan id is received, set the global variable to track this so we can use it in other function
            globalScanId = scanId;

            terminationTime = globalTerminationTime;
            scanTerminated = false;

            $timeLimit.innerHTML = `Time Limit: ${terminationTime} ${terminationTime > 1 ? 'seconds' : 'second'}`;
            const timerInterval = setInterval(() => {
                terminationTime--;
                $timeLimit.innerHTML = `Time Limit: ${terminationTime} ${terminationTime > 1 ? 'seconds' : 'second'}`;

                if (terminationTime <= 0) {
                    scanTerminated = true;
                    $timeLimit.innerHTML = `Time Limit: Scan timed out, updating history...`;

                    clearInterval(timerInterval); 
                    terminateScan(scanId);
                }
            }, 1000)

            // Get the progress from fetchScanProgress function
            const progressData = await fetchScanProgress(scanId);

            if (progressData !== null) {
                // update scan progress on page
                const scanUpdated = await updateScanProgress(progressData, scanId);
                if (scanUpdated) {
                    clearInterval(timerInterval); 
                    $timeLimit.innerHTML = 'Time Limit: Scan completed within time limit, updating history...';
                }
            }
            else {
                console.log("Error fetching scan progress");
            }
        }
    } catch (error) {
        console.log("Error in sending url for scan: ", error);
    }
  }

  async function terminateScan(scanId) {
    try {
        const params = new URLSearchParams({ scanId });
        const response = await fetch(`http://localhost:8800/stopScan/?${params}`);

        if (response.status === 200) {
            fetchScanResults(scanId);
        }
    } catch (error) {
        console.log("Error terminating scan: ", error);
    }
  }

  // Function to update scan progress that is seen on the page
  async function updateScanProgress(progressData, scanId) {
    if (!scanTerminated) {
        $scanProgress.innerHTML = `Scan Progress: ${progressData.status}%`;
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
    $dataList.innerHTML += '<h4>Updating Data List...</h4>'

    // Update the scan results list after scan is completed
    const params = new URLSearchParams({ scanId, inputUrl })
    const response = await fetch(`http://localhost:8800/updateScanResults/?${params}`);

    if (response.status === 200) {
        const scanData = await getScanResultsFromFile();
        if (scanData !== null) {
            updateScanResultsList(scanData);
            console.log("Scan results updated");
            $scanProgress.innerHTML = 'Scan Progress: 0%';
            
            scanQueue.shift();

            const tempQueue = scanQueue.slice(1);
            $scanQueueOld.innerHTML = tempQueue.length !== 0 ? `Queue: ${tempQueue}` : 'Queue: Empty';
            $scanQueue.innerHTML = tempQueue.length !== 0 ? `${tempQueue}` : 'Empty';

            $timeLimit.innerHTML = 'Time Limit: ---';
            
            if (scanQueue.length > 0) {
                console.log("Starting next scan...");
                sendUrlForScan();
            }
            else {
                $currentScan.innerHTML = 'Scanning: Complete';
                $scanProgress.innerHTML = 'Scan Progress: ---';

                $scanTarget.innerHTML = 'Complete';
            }

        }
        else {
            console.log("Error fetching scan data, fetch returned null");
        }
    }
  }

  // Update the scan results list on the frontend
  function updateScanResultsList(scans) {
    // Clear previous data
    $dataList.innerHTML = '';
    
    // Process and display each scan
    scans.forEach(scan => {
        // Display only URL and total number of issues
        $dataList.innerHTML += `<li>${scan.url} - Total Issues: ${scan.results.length}</li>`;
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






})
const progressBar = document.getElementById('scanPage-progressBar');
const progressBarPercentage = document.getElementById('scanPage-progressBar-percentage');
const viewDetails = document.getElementById('scanPage-view-details-container');

const finalPercentage = 100;
const percentageJump = 10;

let loadingSymbol = "--".repeat(Math.floor(100/percentageJump)) + 1;

const lowRisk = document.getElementById('scanPage-low-risk');
const mediumRisk = document.getElementById('scanPage-medium-risk');
const highRisk = document.getElementById('scanPage-high-risk');

const timeElapsed = document.getElementById('scanPage-time-elapsed');
let seconds = -1;
let minutes = 0;
let screenSeconds = seconds;

lowRisk.textContent = "-";
mediumRisk.textContent = "-";
highRisk.textContent = "-";

viewDetails.style.display = 'none';

const performScan = async () => {
  for (let i = 0; i < finalPercentage + 1; i = i + percentageJump) {
    loadingSymbol = "█" + loadingSymbol;
    loadingSymbol = loadingSymbol.slice(0, -2);
    progressBar.textContent = `[ ${loadingSymbol} ]`;
    progressBarPercentage.textContent = `${i}%`;
    
    seconds += 1;
    screenSeconds += 1;
    
    if (seconds % 60 === 0) {
      screenSeconds = 0;
    }

    minutes = Math.floor(seconds/60);
    timeElapsed.textContent = `${minutes}:${screenSeconds}`

    await new Promise((resolve) => setTimeout(resolve, percentageJump*20));
  }
}

performScan().then(() => {
  lowRisk.textContent = String(1);
  mediumRisk.textContent = String(2);
  highRisk.textContent = String(3);
  viewDetails.style.display = 'block'
})