// JavaScript used for the Scanning Page's functionality.

document.addEventListener('DOMContentLoaded', async () => {
    let $scanTarget = document.getElementById('scanPage-scan-target');
    let $progressBar = document.getElementById('scanPage-progressBar');
    let $scanProgress = document.getElementById('scanPage-progressBar-percentage');
    let $viewDetailsButton = document.getElementById('scanPage-view-details-container');
    let $scanStatus = document.getElementById('scanPage-scan-status');

    let $informationalRisk = document.getElementById('scanPage-informational-risk');
    let $lowRisk = document.getElementById('scanPage-low-risk');
    let $mediumRisk = document.getElementById('scanPage-medium-risk');
    let $highRisk = document.getElementById('scanPage-high-risk');
    let $unclassifiedRisk = document.getElementById('scanPage-unclassified-risk');

    let $timeElapsed = document.getElementById('scanPage-time-elapsed');

    let globalTerminationTime = 10; // scan time limit in seconds
    let terminationTime = globalTerminationTime;
    let statusCheckTimer = 1;
    let scanTerminated = false;
    let globalScanId = null;
    let scanQueue = [];

    window.addEventListener('unload', function () {
        scanTerminated = true;
        terminateScan({scanId: globalScanId, reason: 'userAction'});
    });
  
    if ($scanTarget) {
        $scanTarget.addEventListener('click', () => {
            window.open(inputUrl, '_blank');
        })
    }

    const urlParams = new URLSearchParams(window.location.search);
    const inputUrl = urlParams.get('url');

    let currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
    if (currentScan.status === 'Scanning') {
        sendUrlForScan();
    }
    else {
        let savedScanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS')) || {};
        if (Object.keys(savedScanDetails).length > 0) {
            const vulnerabilities = savedScanDetails['vulnerabilities'];
    
            $informationalRisk.textContent = vulnerabilities['informational'];
            $lowRisk.textContent = vulnerabilities['low'];
            $mediumRisk.textContent = vulnerabilities['medium'];
            $highRisk.textContent = vulnerabilities['high'];
            $unclassifiedRisk.textContent = vulnerabilities['unclassified'];
    
            setScanStatus(savedScanDetails['status']);
            $scanTarget.textContent = savedScanDetails['url'];
            $viewDetailsButton.style.display = 'block';
            $timeElapsed.textContent = '-';
            $timeElapsed.style.color = 'white';
            
            $progressBar.style.display = 'block';
            const filledCharsCount = savedScanDetails['progressBar']['filledCharsCount'];
            const filledChars = '█'.repeat(filledCharsCount);
            const dashCharsCount = savedScanDetails['progressBar']['dashCharsCount'];
            const dashChars = '--'.repeat(dashCharsCount);
            $progressBar.textContent = `[ ${filledChars}${dashChars} ]`;
    
            $scanProgress.textContent = `${savedScanDetails['progressBar']['percentage']}%`;
        }
        else {
            $informationalRisk.textContent = '-'
            $lowRisk.textContent = '-';
            $mediumRisk.textContent = '-';
            $highRisk.textContent = '-';
            $unclassifiedRisk.textContent = '-';
            $scanProgress.textContent = '-';
            $timeElapsed.textContent = '-';
            $timeElapsed.style.color = 'white';
            $viewDetailsButton.style.display = 'none';
    
            // first function that begins the scan process
            sendUrlForScan();
        }
    }

    function setScanStatus(status) {
        while ($scanStatus.firstChild) {
            $scanStatus.firstChild.remove();
        }
        const statusSpan = document.createElement('span');
        statusSpan.textContent = status;
        statusSpan.style.color = status === 'Complete' ? 'rgb(0, 255, 0)' : 'rgb(71, 182, 255)';
        $scanStatus.appendChild(statusSpan);
    }
    
    async function sendUrlForScan() {
        try {
            const response = await fetch('http://localhost:8800/submit');
            const result = await response.json();

            if (response.status === 200) {
                $scanTarget.textContent = inputUrl;
                scanQueue.push(inputUrl);
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
                        $timeElapsed.style.color = '#ababab';
        
                        clearInterval(timerInterval); 
                        terminateScan({scanId: scanId, reason: 'timeout'});
                    }
                }, 1000)
        
                setScanStatus('Scanning...');
        
                // Get the progress from fetchScanProgress function
                const progressData = await fetchScanProgress(scanId);
        
                if (progressData !== null) {
                    // update scan progress on page
                    const scanUpdated = await updateScanProgress(progressData, scanId);
                    if (scanUpdated) {
                        clearInterval(timerInterval); 
                        $timeElapsed.textContent = 'Successfully completed scan within time limit. Fetching results...';
                        $timeElapsed.style.color = '#ababab';
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
        if (globalScanId !== null && scanTerminated) {
            try {
                const params = new URLSearchParams({ scanId, reason });
                const response = await fetch(`http://localhost:8800/stopScan/?${params}`);
        
                if (response.status === 200) {
                    reason === 'timeout' && await fetchScanResults(scanId);
        
                    updateCurrentScanInStorage();
                    reason !== 'timeout' && updateScanQueueInStorage();
                }
            } catch (error) {
                console.log("Error terminating scan: ", error);
                updateCurrentScanInStorage();
                updateScanQueueInStorage();
            }
        }
    }
    
    function updateCurrentScanInStorage() {
        const savedScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
        if (Object.keys(savedScan).length > 0) {
            const url = savedScan.url;
            let id = currentScan.id;
            sessionStorage.setItem('CURRENT_SCAN', JSON.stringify({ id: id, url: url, status: 'Complete' }));
        }
    }

    function updateScanQueueInStorage() {
        const savedScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
        const savedQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];
        
        const scanToUpdateIndex = savedQueue.findIndex((scanObj) => scanObj.id === savedScan.id);

        if (scanToUpdateIndex !== -1) {
            savedQueue[scanToUpdateIndex].status = 'Complete';
            localStorage.setItem('SCAN_QUEUE', JSON.stringify(savedQueue));
        } else {
            console.log('Error getting index in update function for scan queue in storage');
        }
    }
    
    // Function to update scan progress that is seen on the page
    async function updateScanProgress(progressData, scanId) {
        if (!scanTerminated) {
            const maxChars = 12;
            const filledCharsCount = Math.round((progressData.status / 100) * maxChars);
            const filledChars = '█'.repeat(filledCharsCount);

            let dashCharsCount = maxChars - filledCharsCount;
            const dashChars = '--'.repeat(dashCharsCount);
    
            $progressBar.textContent = `[ ${filledChars}${dashChars} ]`;
            
            savedScanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS')) || {};
            
            if (!savedScanDetails['progressBar']) {
                savedScanDetails['progressBar'] = {};
            }

            savedScanDetails['progressBar']['filledCharsCount'] = filledCharsCount;
            savedScanDetails['progressBar']['dashCharsCount'] = dashCharsCount;
            savedScanDetails['progressBar']['percentage'] = progressData.status;
            sessionStorage.setItem('SCAN_DETAILS', JSON.stringify(savedScanDetails));
    
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
            // fetchScanResults(scanId);
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
        const sessionId = currentScan.id;
        const params = new URLSearchParams({ scanId, inputUrl, sessionId });
        const response = await fetch(`http://localhost:8800/updateScanResults/?${params}`);
        const result = await response.json();
    
        if (response.status === 200) {
            const scanData = await getScanResultsFromFile();
            if (scanData !== null) {
                // updateScanResultsList(scanData);
                
                $timeElapsed.textContent = '-'; 
                $timeElapsed.style.color = 'white';
                $progressBar.style.display = 'block';
    
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
    
                $viewDetailsButton.style.display = 'block';
    
                setScanStatus('Complete');
    
                scanTerminated = true;
                updateScanDetails({ informationalRisk, lowRisk, mediumRisk, highRisk, unclassifiedRisk });
                
                updateCurrentScanInStorage();
                updateScanQueueInStorage();
            }
            else {
                console.log("Error fetching scan data, fetch returned null");
            }
        }
    }
    
    function updateScanDetails({ informationalRisk, lowRisk, mediumRisk, highRisk, unclassifiedRisk }) {
        savedScanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS'));

        savedScanDetails['url'] = inputUrl;
        savedScanDetails['status'] = 'Complete';
        savedScanDetails['vulnerabilities'] = {
            informational: informationalRisk,
            low: lowRisk,
            medium: mediumRisk,
            high: highRisk,
            unclassified: unclassifiedRisk
        };

        sessionStorage.setItem('SCAN_DETAILS', JSON.stringify(savedScanDetails));
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