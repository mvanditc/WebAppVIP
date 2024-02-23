// JavaScript used for the Homepage's Counter functionality.

const $form = document.getElementById('dataForm');
const $scanStatus = document.getElementById('scanStatus');
const $scanQueue = document.getElementById('scanQueue');

const scanQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];
if (scanQueue.length > 1) {
  displayQueue();
}

$form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const $urlInput = document.getElementById('dataInput');
  const url = $urlInput.value.trim();
  $urlInput.value = '';

  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  const isValid = regex.test(url);
  
  if (isValid) {
    const withinLimit = await userWithinScanLimit(url);
    if (withinLimit) {
      scanQueue.push(url);
      localStorage.setItem('SCAN_QUEUE', JSON.stringify(scanQueue));

      if (scanQueue.length > 1) {
        displayQueue();
      }
      else {
        const response = await fetch('http://localhost:8800/setScanTerminatedValue');
        if (response.status === 200) {
          window.location.href = `scanPage.html?url=${encodeURIComponent(url)}`;
        }
        else {
          console.log('Error fetching scan terminated value');
        }
      }
    }
    else {
      $scanStatus.textContent = 'You have reached the limit of scans allowed in the past 24 hours.'
    }
  }
  else {
    alert('Please enter a valid url.');
  }
})

function displayQueue() {
  const tempQueue = scanQueue.slice(1);
  $scanQueue.textContent = `Scans in queue: ${tempQueue}`;
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