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

let adminModeWarningDiv = document.getElementById("adminModeWarningDiv")
adminModeWarningDiv.style.display = "none"

let scanURLInvalidWarningDiv = document.getElementById("scanURLInvalidWarningDiv")
scanURLInvalidWarningDiv.style.display = "none"

let scanURLRestrictedWarningDiv = document.getElementById("scanURLRestrictedWarningDiv")
scanURLRestrictedWarningDiv.style.display = "none"

queueStatusDiv.style.display = "none"
queueStatusLabel.style.display = "none"
queuePositionSpan.parentElement.style.display = "none"
scansLeftSpan.parentElement.style.display = "none"

let motdSpace = document.getElementById("motdSpace")
let totalVulnerabilitiesCounter = document.getElementById("totalVulnerabilitiesCounter")

let queuePositionClockNeeded = false
let queuePositionClockRunning = false

let currentlyWaitingInQueue = false

let termsOfUseWarningDiv = document.getElementById("termsOfUseWarningDiv")
termsOfUseWarningDiv.style.display = "none"
let termsOfUseAcceptedCheckbox = document.getElementById("termsOfUseAcceptedCheckbox")
termsOfUseAcceptedCheckbox.addEventListener("input", ()=>{
  if (termsOfUseAcceptedCheckbox.checked == true){
    termsOfUseWarningDiv.style.display = "none"
    localStorage.setItem("termsofusestatus", "true")
    // Create a new submit event
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true
    });

    // Dispatch the submit event
    indexDataForm.dispatchEvent(submitEvent);
  }
})

function isValidLink(str) {
  //Check to see if link is proper and host is not localhost or 127.0.0.1
  var urlPattern = /^https?:\/\/[^ "]+$/;
  var urlPatternTestResults = urlPattern.test(str);

  // Test the string against the URL pattern
  return urlPatternTestResults
}

function isUnrestrictedLink(str) {
  //Check to see if link is proper and host is not localhost or 127.0.0.1
  let loopBackCharacters = str.substring(0, 16);
  if (loopBackCharacters == "http://127.0.0.1" || loopBackCharacters == "http://localhost"){
    return false
  }
  loopBackCharacters = str.substring(0, 17);
  if (loopBackCharacters == "https://127.0.0.1" || loopBackCharacters == "https://localhost"){
    return false
  }
  loopBackCharacters = str.substring(0, 11);
  if (loopBackCharacters == "http://127."){
    return false
  }
  loopBackCharacters = str.substring(0, 12);
  if (loopBackCharacters == "https://127."){
    return false
  }

  return true;
}

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
  let storedScanID = sessionStorage.getItem('scanid');
  let storedScanHash = sessionStorage.getItem('scanhash');
  let storedUserID = localStorage.getItem("userid")


  fetch(`http://localhost:3030/get-scan-queue-position`, {
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

      if (data["status"] == "success"){
        currentlyQueuedTextMovingFunction()
        scansLeftSpan.innerText = data['scansLeft']
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

  let inputURL = indexDataInput.value

  let storedUserID = localStorage.getItem("userid")

  if (storedUserID == null){
    storedUserID = "empty"
  }

  let termsOfUseStatus = localStorage.getItem("termsofusestatus")
  if (termsOfUseStatus == null){
    localStorage.setItem("termsofusestatus", "false")
    termsOfUseStatus = localStorage.getItem("termsofusestatus")
  }
  if (termsOfUseStatus == "false"){
    termsOfUseWarningDiv.style.display = ""
  }

  console.log(storedUserID)

  let isValidLinkTest = isValidLink(inputURL)
  let isUnrestrictedLinkTest = isUnrestrictedLink(inputURL)

  if(!isValidLinkTest){
    scanURLInvalidWarningDiv.style.display = ""
  }else{
    scanURLInvalidWarningDiv.style.display = "none"
  }
  if(!isUnrestrictedLinkTest){
    scanURLRestrictedWarningDiv.style.display = ""
  }else{
    scanURLRestrictedWarningDiv.style.display = "none"
  }


  if (isValidLinkTest && isUnrestrictedLinkTest && termsOfUseStatus == "true"){
    let attemptedUsername = sessionStorage.getItem('username');
    let attemptedToken = sessionStorage.getItem('loginToken');
    fetch("http://localhost:3030/add-scan-to-queue", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "url": inputURL,
          "userid": storedUserID,
          "username": attemptedUsername,
          "loginToken": attemptedToken
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
        }else if(data["status"] == "admin mode"){
          adminModeWarningDiv.style.display = ""
        }
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
  }
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

  fetch("http://localhost:3030/get-total-alerts-found")
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      };

      return response.json();
  })
  .then(data => {
      console.log('Total Alerts Found data from the backend:', data);
      totalVulnerabilitiesCounter.innerText = data["stat"]
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
  });
})