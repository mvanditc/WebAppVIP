let feedbackForm = document.getElementById("feedbackForm")
let feedbackEmailInput = document.getElementById("feedbackEmailInput")
let messageTextArea = document.getElementById("messageTextArea")
let cancelButton = document.getElementById("cancelButton")

function sendUserFeedback(){
  console.log("Populating User Feedback Section")
  let enteredEmail = feedbackEmailInput.value
  let enteredMessage = messageTextArea.value
  fetch("http://localhost:3030/submit-user-feedback", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        "email": enteredEmail,
        "message": enteredMessage
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
        alert("Thank you, response submitted successfully, redirecting to homepage...")
        window.location.href = '../../public/html/index.html';
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });
}

feedbackForm.addEventListener("submit", (event)=>{
  event.preventDefault()
  sendUserFeedback()
})

// Add an event listener to the button
cancelButton.addEventListener("click", (event)=> {
  event.preventDefault();
  window.location.href = '../../public/html/index.html';
});