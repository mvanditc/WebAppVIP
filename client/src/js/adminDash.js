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

let feedbackSystemTBody = document.getElementById("feedbackSystemTBody")

let userFeedbackDetailsModal = document.getElementById("userFeedbackDetailsModal")
userFeedbackDetailsModal.style.display = "none"

motdEditorSubmitButton.disabled = true
motdEditorRevertButton.disabled = true

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


function populateMOTDEditorContent(){
    fetch("../../../server/adminDashResponses/1motdPopulatorResponse.json")
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
                if (confirmMOTDChangesInput.checked == true){
                }else{
                }
            }else{
            }  
          })
          confirmMOTDChangesInput.addEventListener("input", ()=>{
            if (motdEditorTextArea.value != storedMOTD){
                if (confirmMOTDChangesInput.checked == true){
                }else{
                }
            }else{
            } 
          })
          motdEditorSubmitButton.addEventListener("click", (event)=>{
            event.preventDefault()
          })
          motdEditorRevertButton.addEventListener("click", ()=>{
          })
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
    });
}

function populateSiteConfigurations(){
    console.log("Populating Site Configurations")
    fetch("../../../server/adminDashResponses/2populateSiteConfigurations.json")
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
      scanSecondsLimitInput.disabled=true
      maxScansPerDayInput.disabled=true
      demoModeSelect.disabled=true
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      //window.location.href = '../../public/html/accessDenied.html';
  });
}

function refreshSiteDailyStats(){
    console.log("Refreshing Daily Site Stats")
    fetch("../../../server/adminDashResponses/3populateSiteDailyStats.json")
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
        //window.location.href = '../../public/html/accessDenied.html';
    });
}

function populateUserFeedbackSection(){
    console.log("Populating User Feedback Section")
    fetch("../../../server/adminDashResponses/4userFeedbackSystemResponse.json")
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

    })
    .catch(error => {
        console.error('Fetch error:', error.message);
        //window.location.href = '../../public/html/accessDenied.html';
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

document.addEventListener("DOMContentLoaded", (event)=>{
  fetch("../../../server/adminDashResponses/0attemptAuthResponse.json")
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
        //window.location.href = '../../public/html/accessDenied.html';
      }else{
            populateSiteConfigurations()
            populateMOTDEditorContent()
            refreshSiteDailyStats()
            populateUserFeedbackSection()
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      //window.location.href = '../../public/html/accessDenied.html';
  });
})