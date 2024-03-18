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

let selectGraphSelect = document.getElementById("selectGraphSelect")
let selectDateSelect = document.getElementById("selectDateSelect")

let dataAnalyticsQueryButton = document.getElementById("dataAnalyticsQueryButton")
dataAnalyticsQueryButton.disabled = true

let feedbackSystemTBody = document.getElementById("feedbackSystemTBody")

let userFeedbackDetailsModal = document.getElementById("userFeedbackDetailsModal")
userFeedbackDetailsModal.style.display = "none"

let userFeedbackStatusChangeSelect = document.getElementById("userFeedbackStatusChangeSelect")
let userFeedbackSaveStatusButton = document.getElementById("userFeedbackSaveStatusButton")
let userFeedbackCancelStatusChangeButton = document.getElementById("userFeedbackCancelStatusChangeButton")
let userFeedbackMessageText = document.getElementById("userFeedbackMessageText")

let userFeedbackDetailsModalEmail = document.getElementById("userFeedbackDetailsModalEmail")
let userFeedbackDetailsModalDate = document.getElementById("userFeedbackDetailsModalDate")
let userFeedbackDetailsModalStatus = document.getElementById("userFeedbackDetailsModalStatus")

let backToHomepageButton = document.getElementById("backToHomepageButton")
backToHomepageButton.addEventListener("click", ()=>{
    sessionStorage.setItem('username', "");
    sessionStorage.setItem('loginToken', "");
    window.location.href = '../../public/html/index.html';
})

let userFeedbackSystem = {}
let selectedUserFeedbackID = ""

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

function populateInitialAnalyticsViewVariables(){
    console.log("Populating Initial Analytics View Variables")
    fetch("http://localhost:3030/get-sql-initial-data", {
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
        let sqlFieldNames = data["columns"]
        let fieldNamesArray = []
        let selectGraphSelectInnerHTML = ""
        let selectDateSelectInnerHTML = ""

        let sqlDates = data["dates"] 
        let datesArray = []

        let rowInnerHTMLName = ""

        sqlFieldNames.forEach(row => {
            if (row["Field"] != "date"){
                fieldNamesArray.push(row["Field"])
                if (row["Field"] == "scanTotal"){
                    rowInnerHTMLName = "Total Scans Per Day"
                }else if (row["Field"] == "totalUsersQueued"){
                    rowInnerHTMLName = "Total Users Queued Per Day"
                }else if (row["Field"] == "totalScanAttempts"){
                    rowInnerHTMLName = "Total Scan Attempts Per Day"
                }else if (row["Field"] == "totalAlertsFound"){
                    rowInnerHTMLName = "Total Alerts Found Per Day"
                }else if (row["Field"] == "totalQueueAutoCorrections"){
                    rowInnerHTMLName = "Total Queue Auto Corrections Per Day"
                }else if (row["Field"] == "totalScanCancels"){
                    rowInnerHTMLName = "Total Cancelled Scans Per Day"
                }else if (row["Field"] == "totalCompletedScans"){
                    rowInnerHTMLName = "Total Completed Scans Per Day"
                }
                selectGraphSelectInnerHTML += `<option value="${row["Field"]}">${rowInnerHTMLName}</option>`
            }
        });
        selectGraphSelect.innerHTML = `<option></option>`
        selectGraphSelect.innerHTML += selectGraphSelectInnerHTML

        sqlDates.forEach(row => {
            datesArray.push(row["DATE_FORMAT(date, '%Y-%m')"])
            selectDateSelectInnerHTML += `<option value="${row["DATE_FORMAT(date, '%Y-%m')"]}">${row["DATE_FORMAT(date, '%Y-%m')"]}</option>`
        });
        selectDateSelect.innerHTML = `<option></option>`
        selectDateSelect.innerHTML += selectDateSelectInnerHTML
        
        
        selectGraphSelect.addEventListener("input", ()=>{
            if (selectGraphSelect.value == "" || selectDateSelect.value == ""){
                dataAnalyticsQueryButton.disabled = true
            }else{
                dataAnalyticsQueryButton.disabled = false
            }
        })
        selectDateSelect.addEventListener("input", ()=>{
            if (selectGraphSelect.value == "" || selectDateSelect.value == ""){
                dataAnalyticsQueryButton.disabled = true
            }else{
                dataAnalyticsQueryButton.disabled = false
            }
        })

    })
    .catch(error => {
        console.error('Fetch error:', error.message);
        window.location.href = '../../public/html/accessDenied.html';
    });
}

function populateUserFeedbackSection(){
    console.log("Populating User Feedback Section")
    fetch("http://localhost:3030/get-submitted-user-feedbacks", {
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
        let userFeedbackSystemData = data["userFeedbackSystem"]
        let feedbackSystemTBodyInnerHTML = ""

        userFeedbackSystemData.forEach(row => {
            console.log(row)
            let date = new Date(parseInt(row["timestamp"]));

            let readableDate = date.toLocaleString();

            userFeedbackSystem[row["timestamp"]] = {
                "email": row["email"],
                "message": row["message"],
                "status": row["status"],
                "date": readableDate
            }

            feedbackSystemTBodyInnerHTML += `
            <tr>
                <td>${readableDate}</td>
                <td>${row["email"]}</td>
                <td>${row["status"]}</td>
                <td><button value="${row["timestamp"]}" class="userFeedbackViewDetailsButton">Details</button></td>
            </tr>
            `
        });
        feedbackSystemTBody.innerHTML = feedbackSystemTBodyInnerHTML;

        let userFeedbackViewDetailsButtons = document.querySelectorAll(".userFeedbackViewDetailsButton")
        userFeedbackViewDetailsButtons.forEach(button => {
            button.addEventListener('click', ()=>{
                viewUserFeedbackDetails(button)
            });
        });

        userFeedbackCancelStatusChangeButton.addEventListener("click", ()=>{
            userFeedbackDetailsModal.style.display = "none"
        })

        userFeedbackStatusChangeSelect.addEventListener("input", ()=>{
            let selectedStatus = userFeedbackStatusChangeSelect.value
            if (selectedStatus == userFeedbackSystem[selectedUserFeedbackID]["status"]){
                userFeedbackSaveStatusButton.disabled = true
            }else{
                userFeedbackSaveStatusButton.disabled = false
            }
        })

        userFeedbackSaveStatusButton.addEventListener("click", changeUserFeedbackStatus)

    })
    .catch(error => {
        console.error('Fetch error:', error.message);
        window.location.href = '../../public/html/accessDenied.html';
    });
}

function viewUserFeedbackDetails(button){
    userFeedbackDetailsModal.style.display = ""
    selectedUserFeedbackID = button.getAttribute("value")
    userFeedbackMessageText.innerText = userFeedbackSystem[selectedUserFeedbackID]["message"]
    userFeedbackStatusChangeSelect.value = userFeedbackSystem[selectedUserFeedbackID]["status"]
    userFeedbackSaveStatusButton.disabled = true
    userFeedbackDetailsModalEmail.innerText = "Email: " + userFeedbackSystem[selectedUserFeedbackID]["email"]
    userFeedbackDetailsModalDate.innerText = "Date: " + userFeedbackSystem[selectedUserFeedbackID]["date"]
    userFeedbackDetailsModalStatus.innerText = "Status: " + userFeedbackSystem[selectedUserFeedbackID]["status"]
}

function changeUserFeedbackStatus(){
    let selectedStatus = userFeedbackStatusChangeSelect.value
    fetch("http://localhost:3030/change-user-feedback-status", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          "username": attemptedUsername,
          "loginToken": attemptedToken,
          "newStatusValue": selectedStatus,
          "feedbackID": selectedUserFeedbackID
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
        if (data["status"] == "success"){
            location.reload();
        }else{
            alert("There was an error...")
        }
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
            populateSiteConfigurations()
            populateMOTDEditorContent()
            refreshSiteDailyStats()
            populateInitialAnalyticsViewVariables()
            populateUserFeedbackSection()
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });
})