document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('dataForm');
  const dataInput = document.getElementById('dataInput');
  const dataList = document.getElementById('dataList');
  const scanProgressDiv = document.getElementById('scanProgress');
  const scanStatusDiv = document.getElementById('scanStatus');
  const scanQueueDiv = document.getElementById('scanQueue');
  const currentScanDiv = document.getElementById('currentScan');
  const timeLimitDiv = document.getElementById('timeLimit');

  // variables to handle frontend changes
  let inputUrl = dataInput.value.trim();
  let scanQueue = [];
  let globalTerminationTime = 10;
  let terminationTime = globalTerminationTime;
  let statusCheckTimer = 1;
  let scanTerminated = false;
  let globalScanId = null;

  scanProgressDiv.innerHTML = 'Scan Progress: ---';
  timeLimitDiv.innerHTML = 'Time Limit: ---';

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
              scanQueueDiv.innerHTML = `Queue: ${tempQueue}`;

              sendUrlForScan();
          }
          else if (response.status === 403) {
              scanStatusDiv.innerHTML = 'You have reached the limit of scans allowed in the past 24 hours.'
          }
      } catch (error) {
          console.error('Error Submitting:', error);
      }
  }

  async function sendUrlForScan() {
      currentScanDiv.innerHTML = `Scanning: ${scanQueue[0]}`;

      try {
          const response = await fetch('http://localhost:8800/submit');
          const result = await response.json();

          if (response.status === 200) {
              const scanId = result.scanId;

              // Once the scan id is received, set the global variable to track this so we can use it in other function
              globalScanId = scanId;

              terminationTime = globalTerminationTime;
              scanTerminated = false;

              timeLimitDiv.innerHTML = `Time Limit: ${terminationTime} ${terminationTime > 1 ? 'seconds' : 'second'}`;
              const timerInterval = setInterval(() => {
                  terminationTime--;
                  timeLimitDiv.innerHTML = `Time Limit: ${terminationTime} ${terminationTime > 1 ? 'seconds' : 'second'}`;

                  if (terminationTime <= 0) {
                      scanTerminated = true;
                      timeLimitDiv.innerHTML = `Time Limit: Scan timed out, updating history...`;

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
                      timeLimitDiv.innerHTML = 'Time Limit: Scan completed within time limit, updating history...';
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
          scanProgressDiv.innerHTML = `Scan Progress: ${progressData.status}%`;
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
      dataList.innerHTML += '<h4>Updating Data List...</h4>'

      // Update the scan results list after scan is completed
      const params = new URLSearchParams({ scanId, inputUrl })
      const response = await fetch(`http://localhost:8800/updateScanResults/?${params}`);

      if (response.status === 200) {
          const scanData = await getScanResultsFromFile();
          if (scanData !== null) {
              updateScanResultsList(scanData);
              console.log("Scan results updated");
              scanProgressDiv.innerHTML = 'Scan Progress: 0%';
              
              scanQueue.shift();

              const tempQueue = scanQueue.slice(1);
              scanQueueDiv.innerHTML = tempQueue.length !== 0 ? `Queue: ${tempQueue}` : 'Queue: Empty';

              timeLimitDiv.innerHTML = 'Time Limit: ---';
              
              if (scanQueue.length > 0) {
                  console.log("Starting next scan...");
                  sendUrlForScan();
              }
              else {
                  currentScanDiv.innerHTML = 'Scanning: Complete';
                  scanProgressDiv.innerHTML = 'Scan Progress: ---';
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
      dataList.innerHTML = '';
      
      // Process and display each scan
      scans.forEach(scan => {
          // Display only URL and total number of issues
          dataList.innerHTML += `<li>${scan.url} - Total Issues: ${scan.results.length}</li>`;
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

  // When user clicks submit then save the url and send this url to be scanned to function
  form.addEventListener('submit', async (event) => {
      event.preventDefault();

      inputUrl = dataInput.value.trim();
      if (inputUrl !== '') {
          dataInput.value = '';
          await addScanRequestToQueue(inputUrl);
      }
  });

  window.addEventListener('beforeunload', function (e) {
      var confirmationMessage = 'Are you sure you want to leave?';
      e.returnValue = confirmationMessage;
  
      return confirmationMessage;
  });

  window.addEventListener('unload', function () {
      terminateScan(globalScanId);
  });
});