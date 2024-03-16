let indexDataForm = document.getElementById("bottom-container")
let indexDataSubmit = document.getElementById("search-button")
let indexDataInput = document.getElementById("search-input")

let queueDetailsContainer = document.getElementById("queueDetailsContainer")
queueDetailsContainer.style.display = "none"

let scanQueueCancelButton = document.getElementById("cancel-button")
scanQueueCancelButton.style.display = "none"
scanQueueCancelButton.disabled = false

let queueStatusLabel = document.getElementById("queueStatusLabel")
let queueStatusDiv = document.getElementById("queueStatusDiv")
let queuePositionSpan = document.getElementById("queuePositionSpan")
let scansLeftSpan = document.getElementById("scansLeftSpan")
let scanLimitReachedWarningDiv = document.getElementById("scanLimitReachedWarningDiv")

scanLimitReachedWarningDiv.style.display = "none"

queueStatusDiv.style.display = "none"
queueStatusLabel.style.display = "none"
queuePositionSpan.parentElement.style.display = "none"
scansLeftSpan.parentElement.style.display = "none"

let motdSpace = document.getElementById("motdSpace")

let queuePositionClockNeeded = false
let queuePositionClockRunning = false

let currentlyWaitingInQueue = false

async function currentlyQueuedTextMovingFunction(){
  if (currentlyWaitingInQueue){
      return
  }
  else{
    queueStatusDiv.style.display = ""
    queueStatusLabel.style.display = ""
    currentlyWaitingInQueue = true
    while (currentlyWaitingInQueue){
      queueStatusDiv.innerText = "Waiting"
        await delay(500)
        queueStatusDiv.innerText = "Waiting."
        await delay(500)
        queueStatusDiv.innerText = "Waiting.."
        await delay(500)
        queueStatusDiv.innerText = "Waiting..."
        await delay(500)
    }
    if (currentlyWaitingInQueue == false){
      queueStatusDiv.innerText = ""
      queueStatusDiv.style.display = "none"
      queueStatusLabel.style.display = "none"
    }
  }
  currentlyWaitingInQueue = false
}

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

function requestToLeaveQueue(){
  let storedScanID = sessionStorage.getItem("scanid")
  let storedScanHash = sessionStorage.getItem("scanhash")
  let storedUserID = localStorage.getItem("userid")
  fetch("http://localhost:3030/remove-scan-from-queue", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "scanid": storedScanID,
        "hash": storedScanHash,
        "userid": storedUserID
      })
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
        location.reload();
      }
        
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
  });
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

      if (data["status"] == "success"){
        currentlyQueuedTextMovingFunction()
        queuePositionSpan.innerText = data["position"]
        queuePositionSpan.parentElement.style.display = ""
        if (data["position"] == "0" && data["isScanning"] == false && data['checkingIfUserIsDisconnected'] == false){
          window.location.href = '../../public/html/scanPage.html';
        }
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
  });
}

indexDataForm.addEventListener("submit", (event)=>{
  event.preventDefault()

  let storedUserID = localStorage.getItem("userid")

  if (storedUserID == null){
    storedUserID = "empty"
  }

  console.log(storedUserID)

  fetch("http://localhost:3030/add-scan-to-queue", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "url": indexDataInput.value,
        "userid": storedUserID
      })
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
        queueDetailsContainer.style.display = ""
        indexDataSubmit.disabled = true
        indexDataSubmit.style.display = "none"

        scanQueueCancelButton.disabled = false
        scanQueueCancelButton.style.display = ""
        
        let receivedScanID = data['scanID']
        let receivedScanHash = data['hash']

        sessionStorage.setItem('scanid', receivedScanID);
        sessionStorage.setItem('scanhash', receivedScanHash);

        if (data['userID'] != "false" && data['userID'] != ""){
          localStorage.setItem("userid", data['userID'])
        }

        scansLeftSpan.innerText = data['scansLeft']
        scansLeftSpan.parentElement.style.display = ""

        queuePositionClockNeeded = true
        queuePositionCheckClock()

        scanQueueCancelButton.addEventListener("click", requestToLeaveQueue)

      }else if(data["status"] == "max scans"){
        scanLimitReachedWarningDiv.style.display = ""
        scansLeftSpan.innerText = "0"
        scansLeftSpan.parentElement.style.display = ""
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
  });
})

document.addEventListener("DOMContentLoaded", (event)=>{
  fetch("http://localhost:3030/get-site-motd")
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      };

      return response.json();
  })
  .then(data => {
      console.log('Site MOTD data from the backend:', data);
      motdSpace.innerHTML = data["motd"]
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
  });
})