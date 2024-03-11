let indexDataForm = document.getElementById("indexDataForm")
let indexDataInput = document.getElementById("indexDataInput")

let queuePositionClockNeeded = false

async function queuePositionCheckClock() {
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
      if (data["position"] == "0" && data["isScanning"] == false){
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