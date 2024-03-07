// JavaScript used for the Homepage's Counter functionality.

const $form = document.getElementById('index-data-form');
const $scanStatusError = document.getElementById('index-scan-status-error');
const $scanQueue = document.getElementById('index-scan-queue');
$submitBtn = document.getElementById('index-submit-button');

let currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
let scanQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];

checkScanQueueLength();

function checkScanQueueLength() {
  currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
  if (Object.keys(currentScan).length > 0 && scanQueue.length > 1 && currentScan.status !== 'Complete') {
    const currentScanningArray = scanQueue.filter((scanObj) => scanObj['status'] === 'Scanning');
    if (currentScanningArray.length > 1) {
      displayQueue(); 
      return false;
    }
    else {
      return true;
    }
  }
  else {
    return true;
  }
}

window.addEventListener('storage', async function (event) {
  if (event.key === 'CURRENT_SCAN') {
    currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
    checkScanQueueLength();
    handleStorageEvent();
  }
  if (event.key === 'SCAN_QUEUE') {
    scanQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || {};
    currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
    checkScanQueueLength();
    handleStorageEvent();
  }
});

function handleStorageEvent() {
  const lastCompletedScansArray = scanQueue.filter((scanObj) => scanObj.status === 'Complete');
  const lastCompletedScan = lastCompletedScansArray.pop();

  if (lastCompletedScan !== undefined) {
    const currentScanIndex = scanQueue.findIndex((scanObj) => scanObj.id === currentScan.id);
    const previousScans = currentScanIndex !== -1 ? scanQueue.slice(0, currentScanIndex) : scanQueue;

    const isScanning = previousScans.some((scanObj) => scanObj.status === 'Scanning');

    if (!isScanning) {
      const nextScanInQueue = scanQueue.find((scanObj) => scanObj.status === 'Scanning');
      if (currentScan.id === nextScanInQueue.id) {
        window.location.href = `scanPage.html?url=${encodeURIComponent(currentScan.url)}`;
      }
    }
  }
}

if ($form) {
  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const $urlInput = document.getElementById('index-data-input');
    url = $urlInput.value.trim();
    $urlInput.value = '';
  
    const regex = /^(ftp|http|https):\/\/[^ "]+$/;
    const isValid = regex.test(url);
    
    if (isValid) {
      const withinLimit = await userWithinScanLimit(url);
      if (withinLimit) {
        const currentScanObj = {
          id: getNextScanId(scanQueue),
          url: url,
          status: 'Scanning'
        };
        sessionStorage.setItem('CURRENT_SCAN', JSON.stringify(currentScanObj));
        
        scanQueue.push(currentScanObj);
        localStorage.setItem('SCAN_QUEUE', JSON.stringify(scanQueue));
        
        const queueEmpty = checkScanQueueLength();
        if (queueEmpty) {
          currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
          if (Object.keys(currentScan).length > 0) {
            if (currentScan.url === url) {
              sessionStorage.setItem('SCAN_DETAILS', JSON.stringify({}));
              window.location.href = `scanPage.html?url=${encodeURIComponent(url)}`;
            }
          }
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
}

function getNextScanId(scanQueue) {
  if (scanQueue.length > 0) {
    const lastId = scanQueue[scanQueue.length - 1].id;
    const nextId = String(Number(lastId) + 1);
    return nextId;
  } else {
    return '1';
  }
}

function displayQueue() {
  currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
  if (Object.keys(currentScan).length > 0) {
    scanQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];
    $submitBtn.disabled = true;
    $scanQueue.textContent = 'Scans in Queue:';
    $scanQueue.appendChild(document.createElement('p'));
  
    const $scanDiv = document.createElement('div');
    const $scanUrl = document.createElement('p');
    const $scanPosition = document.createElement('p');
    const $cancelButton = document.createElement('button');
    $cancelButton.textContent = 'Cancel Scan';
  
    const scanningQueue = scanQueue.filter((scanObj) => scanObj.status === 'Scanning');
    const currentScanIndex = scanningQueue.findIndex((scanObj) => scanObj.id === currentScan.id);
    
    $scanPosition.textContent = `Position: ${currentScanIndex}`;

    $scanPosition.style.marginRight = '5px';
    
    $scanUrl.textContent = `Name: ${currentScan.url},`;
    $scanUrl.style.marginRight = '5px';
    
    $scanDiv.appendChild($scanUrl);
    $scanDiv.appendChild($scanPosition);
    $scanDiv.appendChild($cancelButton);
  
    const scanDivStyles = {
      display: 'flex',
      flexDirection: 'row',
      height: '30px',
      alignItems: 'center',
      justifyContent: 'flex-start'
    }
  
    Object.assign($scanDiv.style, scanDivStyles);
  
    $cancelButton.addEventListener('click', async () => {
      await removeScanFromQueue(currentScan);
    })
    
    $scanQueue.appendChild($scanDiv);
  }
}

async function removeScanFromQueue(currentScan) {
  try {
    const response = await fetch(`http://localhost:8800/removeScanFromQueue/${currentScan.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      scanQueue = scanQueue.filter(scanObj => scanObj.id !== scanIdToRemove);

      localStorage.setItem('SCAN_QUEUE', JSON.stringify(scanQueue));
      sessionStorage.setItem('CURRENT_SCAN', JSON.stringify({}));

      $submitBtn.disabled = false;

      while ($scanQueue.firstChild) {
        $scanQueue.removeChild($scanQueue.firstChild);
      }

      checkScanQueueLength();
    } else {
      console.error('Failed to remove scan from the server');
    }
  } 
  catch (error) {
    console.error('Error during the DELETE request:', error);
  }
}

async function userWithinScanLimit(inputUrl) {
  currentScan = JSON.parse(sessionStorage.getItem('CURRENT_SCAN')) || {};
  console.log('id is: ', currentScan.id);
  try {
    // post request format
    const response = await fetch('http://localhost:8800/addScanToQueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: inputUrl, id: currentScan.id }),
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