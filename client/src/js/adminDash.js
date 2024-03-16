let attemptedUsername = sessionStorage.getItem('username');
let attemptedToken = sessionStorage.getItem('loginToken');
let scanSecondsLimitText = document.getElementById("scanSecondsLimitText")
let maxScansPerDayText = document.getElementById("maxScansPerDayText")
let demoModeText = document.getElementById("demoModeText")
let demoModeSelect = document.getElementById("demoModeSelect")

let scanConfigForm = document.getElementById("scanConfigForm")
let scanSecondsLimitInput = document.getElementById("scanSecondsLimitInput")
let maxScansPerDayInput = document.getElementById("maxScansPerDayInput")
let confirmConfigChangesInput = document.getElementById("confirmConfigChangesInput")
let scanConfigurationSubmitButton = document.getElementById("scanConfigurationSubmitButton")
let scanConfigurationCancelButton = document.getElementById("scanConfigurationCancelButton")

let dailySiteStatsContainer = document.getElementById("dailySiteStatsContainer")
let siteStatsRefreshButton = document.getElementById("siteStatsRefreshButton")

let scanMOTDForm = document.getElementById("scanMOTDForm")
let motdEditorRevertButton = document.getElementById("motdEditorRevertButton")
let motdEditorSubmitButton = document.getElementById("motdEditorSubmitButton")
let motdEditorTextArea = document.getElementById("motdEditorTextArea")
let confirmMOTDChangesInput = document.getElementById("confirmMOTDChangesInput")
let storedMOTD = ""

function requestToChangeServerStoredMOTD(newMOTDValue){
    console.log("Requesting Server to Change Site MOTD")
    console.log(newMOTDValue)
    let newMOTDParameter = newMOTDValue

    fetch("http://localhost:3030/change-site-motd", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "username": attemptedUsername,
          "loginToken": attemptedToken,
          "valueForSiteMOTD": newMOTDParameter
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      };

      return response.json();
  })
  .then(data => {
      console.log('Authentication data from the backend:', data);
      if (data["status"] == "success"){
        alert("Site MOTD Changed...")
        
        motdEditorSubmitButton.disabled = true
        motdEditorRevertButton.disabled = true
        confirmMOTDChangesInput.checked = false
        refreshMOTDEditorContent()
      }else{
        alert("UNSUCCESSFUL STATUS: ", data["status"])
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });
}

function requestToChangeServerConfigurations(scanSecondsLimitInputValue, maxScansPerDayInputValue, demoModeInputValue){
    console.log("Requesting Server to Change Site Settings")
    let scanSecondsLimitParameter = scanSecondsLimitInputValue
    let maxScansPerDayParameter = maxScansPerDayInputValue
    let demoModeParameter = demoModeInputValue

    confirmConfigChangesInput.checked = false
    scanSecondsLimitInput.value = ""
    maxScansPerDayInput.value = ""
    if (scanSecondsLimitParameter == ""){
        scanSecondsLimitParameter = "null"
    }
    if (maxScansPerDayParameter == ""){
        maxScansPerDayParameter = "null"
    }
    if (demoModeParameter == ""){
        demoModeParameter = "null"
    }
    fetch("http://localhost:3030/change-site-configuration", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "username": attemptedUsername,
          "loginToken": attemptedToken,
          "valueForScanSeconds": scanSecondsLimitParameter,
          "valueForScanPerDay": maxScansPerDayParameter,
          "demoMode": demoModeParameter
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      };

      return response.json();
  })
  .then(data => {
      console.log('Authentication data from the backend:', data);
      if (data["status"] == "success"){
        alert("Settings Change Request Sent...")
        location.reload()
      }else{
        alert("UNSUCCESSFUL STATUS: ", data["status"])
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });

}


function populateMOTDEditorContent(){
    fetch("http://localhost:3030/get-site-motd")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        return response.json();
    })
    .then(data => {
        console.log('Site MOTD data from the backend:', data);
        motdEditorTextArea.value = data["motd"]
        storedMOTD = data["motd"]

        motdEditorTextArea.addEventListener("input", ()=>{
            if (motdEditorTextArea.value != storedMOTD){
                motdEditorRevertButton.disabled = false
                if (confirmMOTDChangesInput.checked == true){
                    motdEditorSubmitButton.disabled = false
                }else{
                    motdEditorSubmitButton.disabled = true
                }
            }else{
                motdEditorSubmitButton.disabled = true
                motdEditorRevertButton.disabled = true
            }  
          })
          confirmMOTDChangesInput.addEventListener("input", ()=>{
            if (motdEditorTextArea.value != storedMOTD){
                motdEditorRevertButton.disabled = false
                if (confirmMOTDChangesInput.checked == true){
                    motdEditorSubmitButton.disabled = false
                }else{
                    motdEditorSubmitButton.disabled = true 
                }
            }else{
                motdEditorSubmitButton.disabled = true
                motdEditorRevertButton.disabled = true
            } 
          })
          motdEditorSubmitButton.addEventListener("click", (event)=>{
            event.preventDefault()
            requestToChangeServerStoredMOTD(motdEditorTextArea.value)
          })
          motdEditorRevertButton.addEventListener("click", ()=>{
            motdEditorSubmitButton.disabled = true
            motdEditorRevertButton.disabled = true
            confirmMOTDChangesInput.checked = false
            refreshMOTDEditorContent()
          })
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

function refreshMOTDEditorContent(){
    fetch("http://localhost:3030/get-site-motd")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        return response.json();
    })
    .then(data => {
        console.log('Site MOTD data from the backend:', data);
        motdEditorTextArea.value = data["motd"]
        storedMOTD = data["motd"]
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

function populateSiteConfigurations(){
    console.log("Populating Site Configurations")
    fetch("http://localhost:3030/get-site-configurations-for-admin", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      console.log('Server configurations from the backend:', data);
      let scanSecondsLimitValue = data["siteSettings"]["scanSecondsLimit"]
      let maxScansPerDayValue = data["siteSettings"]["maxScansPerDay"]
      let adminDemoModeValue = data["siteSettings"]["adminDemoMode"]

      scanSecondsLimitText.innerHTML = "&nbsp;&nbsp;Scan Seconds Limit: " + scanSecondsLimitValue
      maxScansPerDayText.innerHTML = "&nbsp;&nbsp;Max Scans Per Day: " + maxScansPerDayValue
      demoModeText.innerHTML = "&nbsp;&nbsp;Demo Mode Status: " + adminDemoModeValue

      scanSecondsLimitInput.placeholder = parseInt(scanSecondsLimitValue)
      maxScansPerDayInput.placeholder = parseInt(maxScansPerDayValue)
      demoModeSelect.value = adminDemoModeValue

      demoModeSelect.addEventListener("input", ()=>{
        if (maxScansPerDayInput.value != "" || scanSecondsLimitInput.value != "" || demoModeSelect.value != adminDemoModeValue){
            scanConfigurationCancelButton.disabled = false
            if (confirmConfigChangesInput.checked == true){
                scanConfigurationSubmitButton.disabled = false
            }else{
                scanConfigurationSubmitButton.disabled = true
            }
        }else{
            scanConfigurationSubmitButton.disabled = true
            scanConfigurationCancelButton.disabled = true
        } 
      })
      scanSecondsLimitInput.addEventListener("input", ()=>{
        if (scanSecondsLimitInput.value != "" || maxScansPerDayInput.value != "" || demoModeSelect.value != adminDemoModeValue){
            scanConfigurationCancelButton.disabled = false
            if (confirmConfigChangesInput.checked == true){
                scanConfigurationSubmitButton.disabled = false
            }else{
                scanConfigurationSubmitButton.disabled = true
            }
        }else{
            scanConfigurationSubmitButton.disabled = true
            scanConfigurationCancelButton.disabled = true
        }
      })
      maxScansPerDayInput.addEventListener("input", ()=>{
        if (maxScansPerDayInput.value != "" || scanSecondsLimitInput.value != "" || demoModeSelect.value != adminDemoModeValue){
            scanConfigurationCancelButton.disabled = false
            if (confirmConfigChangesInput.checked == true){
                scanConfigurationSubmitButton.disabled = false
            }else{
                scanConfigurationSubmitButton.disabled = true
            }
        }else{
            scanConfigurationSubmitButton.disabled = true
            scanConfigurationCancelButton.disabled = true
        }  
      })
      confirmConfigChangesInput.addEventListener("input", ()=>{
        if (maxScansPerDayInput.value != "" || scanSecondsLimitInput.value != "" || demoModeSelect.value != adminDemoModeValue){
            scanConfigurationCancelButton.disabled = false
            if (confirmConfigChangesInput.checked == true){
                scanConfigurationSubmitButton.disabled = false
            }else{
                scanConfigurationSubmitButton.disabled = true
            }
        }else{
            scanConfigurationSubmitButton.disabled = true
            scanConfigurationCancelButton.disabled = true
        } 
      })
      scanConfigurationSubmitButton.addEventListener("click", (event)=>{
        event.preventDefault()
        requestToChangeServerConfigurations(scanSecondsLimitInput.value, maxScansPerDayInput.value, demoModeSelect.value)
      })
      scanConfigurationCancelButton.addEventListener("click", ()=>{
        scanConfigurationSubmitButton.disabled = true
        scanConfigurationCancelButton.disabled = true 
        maxScansPerDayInput.value = ""
        scanSecondsLimitInput.value = ""
        confirmConfigChangesInput.checked = false
        demoModeSelect.value = adminDemoModeValue
      })
      siteStatsRefreshButton.addEventListener("click", ()=>{
        refreshSiteDailyStats()
      })


  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });
}

function refreshSiteDailyStats(){
    console.log("Refreshing Daily Site Stats")
    fetch("http://localhost:3030/get-site-daily-stats-as-admin", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
        console.log(data)
        let dailySiteStats = data["dailyStats"]
        dailySiteStatsContainer.innerHTML = `
        <span>24 Hour Site Stats:</span>
        <span>&nbsp;&nbsp;Users Queued: ${dailySiteStats["usersQueued"]}</span>
        <span>&nbsp;&nbsp;Scans Attempted: ${dailySiteStats["scansAttempted"]}</span>
        <span>&nbsp;&nbsp;Alerts Found: ${dailySiteStats["alertsFound"]}</span>
        <span>&nbsp;&nbsp;Queue Auto Corrections: ${dailySiteStats["queueAutoCorrections"]}</span>
        <span>&nbsp;&nbsp;Scan Cancels: ${dailySiteStats["scanCancels"]}</span>
        <span>&nbsp;&nbsp;Completed Scans: ${dailySiteStats["completedScans"]}</span>
        `

    })
    .catch(error => {
        console.error('Fetch error:', error.message);
        window.location.href = '../../public/html/accessDenied.html';
    });
}

document.addEventListener("DOMContentLoaded", (event)=>{
  fetch("http://localhost:3030/attempt-authentication", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      console.log('Authentication data from the backend:', data);
      if (data["status"] != "success"){
        alert("UNSUCCESSFUL STATUS: ", data["status"])
        window.location.href = '../../public/html/accessDenied.html';
      }else{
            alert("Welcome Admin!")
            populateSiteConfigurations()
            populateMOTDEditorContent()
            refreshSiteDailyStats()
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });
})