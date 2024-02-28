// JavaScript used for the Homepage's Counter functionality.

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
        scanQueue.push(url);
        localStorage.setItem('SCAN_QUEUE', JSON.stringify(scanQueue));
  
        const queueEmpty = checkScanQueueLength();
        if (queueEmpty) {
          sessionStorage.setItem('SCAN_DETAILS', JSON.stringify({}));
          window.location.href = `scanPage.html?url=${encodeURIComponent(url)}`;
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