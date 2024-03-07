// JavaScript used for the Scanning Page's functionality.

document.addEventListener('DOMContentLoaded', async () => {
    // HTML elements
    let $scanTarget = document.getElementById('scanPage-scan-target');
    let $progressBar = document.getElementById('scanPage-progressBar');
    let $scanProgress = document.getElementById('scanPage-progressBar-percentage');
    let $timeElapsed = document.getElementById('scanPage-time-elapsed');
    let $viewDetailsButton = document.getElementById('scanPage-view-details-container');
    let $scanStatus = document.getElementById('scanPage-scan-status');
    let $timeLimitMessage = document.getElementById('scanPage-time-limit-message');
    let $timeLimit = document.getElementById('scanPage-time-limit-text');

    let $informationalRisk = document.getElementById('scanPage-informational-risk');
    let $lowRisk = document.getElementById('scanPage-low-risk');
    let $mediumRisk = document.getElementById('scanPage-medium-risk');
    let $highRisk = document.getElementById('scanPage-high-risk');
    let $unclassifiedRisk = document.getElementById('scanPage-unclassified-risk');

    // Time remaining in seconds
    let globalTerminationTime = 8; 
    let terminationTime = globalTerminationTime;

    let globalElapsedTime = 0;
    let elapsedTime = globalElapsedTime;

    // Represents how often to check scan progress
    let statusCheckTimer = 1;

    // Used for boolean checks, set to true whenever scan is terminated
    let scanTerminated = false;

    // The current scan id which can be used anywhere
    let globalScanId = null;

    // Keeps track of the scans in queue
    let scanQueue = [];

    $timeLimit.textContent = `Time Limit: ${getFormattedTime(globalTerminationTime)}`;

    // Called when user refreshes or leaves the page
    window.addEventListener('beforeunload', async function (event) {
        const currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
        const scanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS')) || {};
      
        // Show dialog if user wants to leave page while scan is in progress
        // First check: Wait for scan details to populate when the page is loaded. Second check: Don't show the dialog when submitting another scan on the main page. Third check: Check if the scan is in progress
        if (Object.keys(scanDetails).length > 0 && scanDetails.status !== 'Complete' && currentScan.status === 'Scanning') {
            const confirmationMessage = 'Are you sure you want to leave?';
            event.returnValue = confirmationMessage; 
            return confirmationMessage; 
        }
    });

    // Refresh the page
    window.addEventListener('unload', function () {
        scanTerminated = true;
        terminateScan({scanId: globalScanId, reason: 'userAction'});
    });

    // Click scan target to open site in new tab
    if ($scanTarget) {
        $scanTarget.addEventListener('click', () => {
            window.open(inputUrl, '_blank');
        })
    }

    // Get the submitted url from search bar
    const urlParams = new URLSearchParams(window.location.search);
    const inputUrl = urlParams.get('url');

    let currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
    // User submitted new scan so status is Scanning, start the scan process
    if (currentScan.status === 'Scanning') {
        sendUrlForScan();
    }
    // Scan status is complete so check next conditions
    else {
        let savedScanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS')) || {};

        // Scan was performed and its details are saved in session storage so load those details when loading this page again
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
            $timeElapsed.textContent = getFormattedTime(savedScanDetails['timeElapsed']);
            $timeElapsed.style.color = 'white';
            
            $progressBar.style.display = 'block';
            const filledCharsCount = savedScanDetails['progressBar']['filledCharsCount'];
            const filledChars = '█'.repeat(filledCharsCount);
            const dashCharsCount = savedScanDetails['progressBar']['dashCharsCount'];
            const dashChars = '--'.repeat(dashCharsCount);
            $progressBar.textContent = `[ ${filledChars}${dashChars} ]`;
    
            $scanProgress.textContent = `${savedScanDetails['progressBar']['percentage']}%`;
            if (savedScanDetails['progressBar']['percentage'] !== 100) {
                $timeLimitMessage.style.display = 'block';
                $timeLimitMessage.textContent = '( Time Limit Exceeded - Scan Terminated Prematurely )';
            }
            else {
                $timeLimitMessage.style.display = 'none';
            }
        }
        // Scan was not performed so start the scan process
        else {
            $informationalRisk.textContent = '-'
            $lowRisk.textContent = '-';
            $mediumRisk.textContent = '-';
            $highRisk.textContent = '-';
            $unclassifiedRisk.textContent = '-';
            $scanProgress.textContent = '-';
            $timeLimitMessage.style.display = 'none';
            $timeElapsed.textContent = '-';
            $timeElapsed.style.color = 'white';
            $viewDetailsButton.style.display = 'none';
            $timeLimit.textContent= '-';
    
            sendUrlForScan();
        }
    }

    // Set scan status that is shown on the page
    function setScanStatus(status) {
        while ($scanStatus.firstChild) {
            $scanStatus.firstChild.remove();
        }
        const statusSpan = document.createElement('span');
        statusSpan.textContent = status;
        if (status === 'Complete') {
            statusSpan.style.color = 'rgb(0, 255, 0)';
        }
        else if (status === 'Scanning...') {
            statusSpan.style.color = 'rgb(71, 182, 255)';
        }
        else if (status === 'Terminated') {
            statusSpan.style.color = 'rgb(255, 0, 0)';
        }
        $scanStatus.appendChild(statusSpan);
    }
    
    // Main function to start the scan process
    async function sendUrlForScan() {
        try {
            const response = await fetch('http://localhost:8800/submit');
            const result = await response.json();

            if (response.status === 200) {
                // Clear scan details if user submits another scan on same tab
                sessionStorage.setItem('SCAN_DETAILS', JSON.stringify({}));

                const scanId = result.scanId;
                $scanTarget.textContent = inputUrl;

                // Push the url into the scan queue
                scanQueue.push(inputUrl);
        
                // Once scan id is received, set the global variable
                globalScanId = scanId;
        
                terminationTime = globalTerminationTime;
                scanTerminated = false;
        
                $timeElapsed.textContent = getFormattedTime(elapsedTime);
                $timeLimitMessage.style.display = 'none';

                const savedScanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS')) || {};
                if (!savedScanDetails['timeElapsed']) {
                    savedScanDetails['timeElapsed'] = {};
                }
                
                // Scan timer
                const timerInterval = setInterval(() => {
                    elapsedTime++;
                    $timeElapsed.textContent = getFormattedTime(elapsedTime);

                    if (!scanTerminated) {
                        let savedScanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS')) || {};
                        savedScanDetails = {
                            ...savedScanDetails,
                            timeElapsed: elapsedTime
                        };
                        sessionStorage.setItem('SCAN_DETAILS', JSON.stringify(savedScanDetails));

                        if (elapsedTime >= terminationTime) {
                            scanTerminated = true;
                            $timeLimitMessage.style.display = 'block';
                            $timeLimitMessage.textContent = `( Exceeded scan time limit. Fetching results... )`;
                            $timeLimitMessage.style.color = '#ababab';
            
                            clearInterval(timerInterval); 
                            terminateScan({scanId: scanId, reason: 'timeout'});
                        }
                    }
                    // savedScanDetails['timeElapsed'] = elapsedTime;
                    // sessionStorage.setItem('SCAN_DETAILS', JSON.stringify(savedScanDetails));
        
                    // Timer reached 0
                }, 1000)
        
                setScanStatus('Scanning...');
        
                // Call function that gets the scan progress
                const progressData = await fetchScanProgress(scanId);
        
                if (progressData !== null) {
                    // First call to update the scan progress, after this the function is called multiple times to update scan progress seen on the page
                    const scanUpdated = await updateScanProgress(progressData, scanId);
                    if (scanUpdated) {
                        clearInterval(timerInterval); 
                        $timeLimitMessage.style.display = 'block';
                        $timeLimitMessage.textContent = '( Successfully completed scan within time limit. Fetching results... )';
                        $timeLimitMessage.style.color = '#ababab';
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
    function getFormattedTime(seconds) {
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
    
    // Terminate the scan
    async function terminateScan({ scanId, reason }) {
        // Check if there exists a scan to be terminated, and if value of scanTerminated is true
        if (globalScanId !== null && scanTerminated) {
            try {
                const params = new URLSearchParams({ scanId, reason });
                const response = await fetch(`http://localhost:8800/stopScan/?${params}`);
        
                if (response.status === 200) {
                    // Reason timeout means the scan was actually performed, and the user did not leave or refresh the page. Fetch the results in this case
                    if (reason === 'timeout') {
                        await fetchScanResults(scanId);
                    } 
                    else if (reason === 'userAction') {
                        handleUserActionPageUnload();
                    }
        
                    updateCurrentScanInStorage();

                    // fetchScanResults will call this function so avoid executing it twice
                    reason !== 'timeout' && updateScanQueueInStorage();
                }
            } catch (error) {
                console.log("Error terminating scan: ", error);

                if (reason === 'userAction') {
                    handleUserActionPageUnload();
                }

                // Even upon error, update the scans in storage
                updateCurrentScanInStorage();
                updateScanQueueInStorage();
            }
        }
    }

    function handleUserActionPageUnload() {
        $viewDetailsButton.style.display = 'none';
        setScanStatus('Terminated');
    }
    
    // Update current scan in session storage
    function updateCurrentScanInStorage() {
        const savedScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
        if (Object.keys(savedScan).length > 0) {
            const url = savedScan.url;
            let id = currentScan.id;

            // Set current scan status to complete
            sessionStorage.setItem('CURRENT_SCAN', JSON.stringify({ id: id, url: url, status: 'Complete' }));
        }
    }

    // Update scan queue in local storage
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
            $viewDetailsButton.style.display = 'none';
            
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
        const savedScanDetails = JSON.parse(sessionStorage.getItem('SCAN_DETAILS')) || {};
    
        if (response.status === 200) {
            const scanData = await getScanResultsFromFile();
            if (scanData !== null) {
                $timeElapsed.style.color = 'white';
                $timeElapsed.textContent = getFormattedTime(savedScanDetails['timeElapsed']);
                if (savedScanDetails['progressBar']['percentage'] !== 100) {
                    $timeLimitMessage.style.display = 'block';
                } 
                else {
                    $timeLimitMessage.style.display = 'none';
                }
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

                if (savedScanDetails['progressBar']['percentage'] !== 100) {
                    $timeLimitMessage.style.display = 'block';
                    $timeLimitMessage.textContent = '( Time Limit Exceeded - Scan Terminated Prematurely )';
                }
                else {
                    $timeLimitMessage.style.display = 'none';
                }
    
                setScanStatus('Complete');
    
                scanTerminated = true;
                
                updateCurrentScanInStorage();
                updateScanQueueInStorage();

                updateScanDetails({ informationalRisk, lowRisk, mediumRisk, highRisk, unclassifiedRisk });
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