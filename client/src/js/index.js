// JavaScript used for the Homepage's Counter functionality.

const $form = document.getElementById('dataForm');
const $scanStatus = document.getElementById('scanStatus');

$form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = document.getElementById('dataInput').value.trim();

  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  const isValid = regex.test(url);
  
  if (isValid) {
    const withinLimit = await userWithinScanLimit(url);
    if (withinLimit) {
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