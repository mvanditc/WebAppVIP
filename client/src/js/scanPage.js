// JavaScript used for the Scanning Page's functionality.

document.addEventListener('DOMContentLoaded', async () => {
  let $scanTarget = document.getElementById('scanPage-scan-target');
  let $progressBar = document.getElementById('scanPage-progressBar');
  let $scanProgress = document.getElementById('scanPage-progressBar-percentage');
  let $viewDetailsButton = document.getElementById('scanPage-view-details-container');
  let $lowRisk = document.getElementById('scanPage-low-risk');
  let $mediumRisk = document.getElementById('scanPage-medium-risk');
  let $highRisk = document.getElementById('scanPage-high-risk');
  let $timeElapsed = document.getElementById('scanPage-time-elapsed');

  let globalTerminationTime = 15;
  let terminationTime = globalTerminationTime;
  let statusCheckTimer = 1;
  let scanTerminated = false;
  let globalScanId = null;
  let scanQueue = [];
  
//   window.addEventListener('beforeunload', function (e) {
//     var confirmationMessage = 'Are you sure you want to leave?';
//     e.returnValue = confirmationMessage;

//     return confirmationMessage;
//   });

  window.addEventListener('unload', function () {
    terminateScan({scanId: globalScanId, reason: 'userAction'});
  });

  $scanTarget.addEventListener('click', () => {
    window.open(inputUrl, '_blank');
  })

  const urlParams = new URLSearchParams(window.location.search);
  const inputUrl = urlParams.get('url');

  // first function that begins the scan process
  sendUrlForScan();
  scanQueue.push(inputUrl);

  const finalPercentage = 100;
  const percentageJump = 10;

  let loadingSymbol = "--".repeat(Math.floor(100/percentageJump)) + 1;

  let seconds = -1;
  let minutes = 0;
  let screenSeconds = seconds;

  $lowRisk.textContent = "-";
  $mediumRisk.textContent = "-";
  $highRisk.textContent = "-";

  $viewDetailsButton.style.display = 'none';

  async function sendUrlForScan() {
    $scanTarget.textContent = inputUrl;

    try {
        const response = await fetch('http://localhost:8800/submit');
        const result = await response.json();

        if (response.status === 200) {
            const scanId = result.scanId;

            // Once the scan id is received, set the global variable to track this so we can use it in other function
            globalScanId = scanId;

            terminationTime = globalTerminationTime;
            scanTerminated = false;

            $timeElapsed.textContent = `${terminationTime} ${terminationTime > 1 ? 'seconds' : 'second'}`;
            
            const timerInterval = setInterval(() => {
                terminationTime--;
                $timeElapsed.textContent = `${terminationTime} ${terminationTime > 1 ? 'seconds' : 'second'}`;

                if (terminationTime <= 0) {
                    scanTerminated = true;
                    $timeElapsed.textContent = `Exceeded scan time limit. Fetching results...`;

                    clearInterval(timerInterval); 
                    terminateScan({scanId: scanId, reason: 'timeout'});
                }
            }, 1000)

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
    } catch (error) {
        console.log("Error in sending url for scan: ", error);
    }
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
    const params = new URLSearchParams({ scanId, inputUrl })
    const response = await fetch(`http://localhost:8800/updateScanResults/?${params}`);

    if (response.status === 200) {
        const scanData = await getScanResultsFromFile();
        if (scanData !== null) {
            // updateScanResultsList(scanData);
            
            $scanProgress.textContent = '-';
            $timeElapsed.textContent = '-';

            $lowRisk.textContent = String(1);
            $mediumRisk.textContent = String(2);
            $highRisk.textContent = String(3);
            $viewDetailsButton.style.display = 'block'

            updateScanQueue();
        }
        else {
            console.log("Error fetching scan data, fetch returned null");
        }
    }
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
})