let attemptedUsername = sessionStorage.getItem('username');
let attemptedToken = sessionStorage.getItem('loginToken');
let scanSecondsLimitText = document.getElementById("scanSecondsLimitText")
let maxScansPerDayText = document.getElementById("maxScansPerDayText")

let scanConfigForm = document.getElementById("scanConfigForm")
let scanSecondsLimitInput = document.getElementById("scanSecondsLimitInput")
let maxScansPerDayInput = document.getElementById("maxScansPerDayInput")
let confirmConfigChangesInput = document.getElementById("confirmConfigChangesInput")
let scanConfigurationSubmitButton = document.getElementById("scanConfigurationSubmitButton")
let scanConfigurationCancelButton = document.getElementById("scanConfigurationCancelButton")

let scanMOTDForm = document.getElementById("scanMOTDForm")
let motdEditorRevertButton = document.getElementById("motdEditorRevertButton")
let motdEditorSubmitButton = document.getElementById("motdEditorSubmitButton")
let motdEditorTextArea = document.getElementById("motdEditorTextArea")
let confirmMOTDChangesInput = document.getElementById("confirmMOTDChangesInput")
let storedMOTD = ""

let siteStatsRefreshButton = document.getElementById("siteStatsRefreshButton")

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

function requestToChangeServerConfigurations(scanSecondsLimitInputValue, maxScansPerDayInputValue){
    console.log("Requesting Server to Change Site Settings")
    let scanSecondsLimitParameter = scanSecondsLimitInputValue
    let maxScansPerDayParameter = maxScansPerDayInputValue

    confirmConfigChangesInput.checked = false
    scanSecondsLimitInput.value = ""
    maxScansPerDayInput.value = ""
    if (scanSecondsLimitParameter == ""){
        scanSecondsLimitParameter = "null"
    }
    if (maxScansPerDayParameter == ""){
        maxScansPerDayParameter = "null"
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
          "valueForScanPerDay": maxScansPerDayParameter
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
        refreshSiteConfigurations()
      }else{
        alert("UNSUCCESSFUL STATUS: ", data["status"])
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });

}

function refreshSiteConfigurations(){
    console.log("Refreshing Site Configurations")
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

      scanSecondsLimitText.innerHTML = "&nbsp;&nbsp;Scan Seconds Limit: " + scanSecondsLimitValue
      maxScansPerDayText.innerHTML = "&nbsp;&nbsp;Max Scans Per Day: " + maxScansPerDayValue

      scanSecondsLimitInput.placeholder = parseInt(scanSecondsLimitValue)
      maxScansPerDayInput.placeholder = parseInt(maxScansPerDayValue)
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

      scanSecondsLimitText.innerHTML = "&nbsp;&nbsp;Scan Seconds Limit: " + scanSecondsLimitValue
      maxScansPerDayText.innerHTML = "&nbsp;&nbsp;Max Scans Per Day: " + maxScansPerDayValue

      scanSecondsLimitInput.placeholder = parseInt(scanSecondsLimitValue)
      maxScansPerDayInput.placeholder = parseInt(maxScansPerDayValue)

      scanSecondsLimitInput.addEventListener("input", ()=>{
        if (scanSecondsLimitInput.value != "" || maxScansPerDayInput.value != ""){
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
        if (maxScansPerDayInput.value != "" || scanSecondsLimitInput.value != ""){
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
        if (maxScansPerDayInput.value != "" || scanSecondsLimitInput.value != ""){
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
        requestToChangeServerConfigurations(scanSecondsLimitInput.value, maxScansPerDayInput.value)
      })
      scanConfigurationCancelButton.addEventListener("click", ()=>{
        scanConfigurationSubmitButton.disabled = true
        scanConfigurationCancelButton.disabled = true 
        maxScansPerDayInput.value = ""
        scanSecondsLimitInput.value = ""
        confirmConfigChangesInput.checked = false
      })
      siteStatsRefreshButton.addEventListener("click", refreshSiteConfigurations)


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
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });
})