let indexDataForm = document.getElementById("bottom-container")
let indexDataSubmit = document.getElementById("search-button")
let indexDataInput = document.getElementById("search-input")

let queuePositionClockNeeded = false
let queuePositionClockRunning = false

async function queuePositionCheckClock() {
  if (queuePositionClockRunning == true){
    return
  }
  queuePositionClockRunning = true
  while (queuePositionClockNeeded) {
    getCurrentQueuePosition();
    await delay(1000);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentQueuePosition(){
  const storedScanID = sessionStorage.getItem('scanid');
  const storedScanHash = sessionStorage.getItem('scanhash');

  fetch(`http://localhost:3030/get-scan-queue-position?scanid=${storedScanID}`)
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      };

      return response.json();
  })
  .then(data => {
      console.log('Data from the backend:', data);
      if (data["position"] == "0" && data["isScanning"] == false && data['checkingIfUserIsDisconnected'] == false){
        window.location.href = '../../public/html/scanPage.html';
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
  });
}

indexDataForm.addEventListener("submit", (event)=>{
  event.preventDefault()
  fetch("http://localhost:3030/add-scan-to-queue", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"url": indexDataInput.value})
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      };

      return response.json();
  })
  .then(data => {
      console.log('Data from the backend:', data);
      if (data['status'] == "success"){
        indexDataSubmit.disabled = true
        indexDataSubmit.classList.add("search-button-disabled")
        
        let receivedScanID = data['scanID']
        let receivedScanHash = data['hash']

        sessionStorage.setItem('scanid', receivedScanID);
        sessionStorage.setItem('scanhash', receivedScanHash);

        queuePositionClockNeeded = true
        queuePositionCheckClock()

      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
  });
})