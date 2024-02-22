// JavaScript used for the Homepage's Counter functionality.

const $form = document.getElementById('dataForm');
const $scanStatus = document.getElementById('scanStatus');
const $scanQueue = document.getElementById('scanQueue');

const scanQueue = JSON.parse(localStorage.getItem('SCAN_QUEUE')) || [];
displayQueue();

$form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = document.getElementById('dataInput').value.trim();

  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  const isValid = regex.test(url);
  
  if (isValid) {
    const withinLimit = await userWithinScanLimit(url);
    if (withinLimit) {
      addUrlToQueue(url);
      displayQueue();
      window.location.href = `scanPage.html?url=${encodeURIComponent(url)}`
    }
    else {
      $scanStatus.innerHTML = 'You have reached the limit of scans allowed in the past 24 hours.'
    }
  }
  else {
    alert('Please enter a valid url.');
  }
})

function addUrlToQueue(inputUrl) {
  scanQueue.push(inputUrl);
  localStorage.setItem('SCAN_QUEUE', JSON.stringify(scanQueue));
}

function displayQueue() {
  if (scanQueue.length > 0) {
    const tempQueue = scanQueue.slice(1);
    $scanQueue.innerHTML = `Queue: ${tempQueue}`;
  }
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

// custom event listener
window.addEventListener('performNextScanInQueue' , (event) => {
  console.log('hi there');
})