let loginForm = document.getElementById("loginForm");
let loginUsernameInput = document.getElementById("loginUsernameInput");
let loginPasswordInput = document.getElementById("loginPasswordInput");

loginForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    console.log("LOGIN SUBMITTED")

    let attemptedUsername = loginUsernameInput.value
    let attemptedPassword = loginPasswordInput.value

    fetch("http://localhost:3022/attempt-login", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": attemptedUsername,
            "password": attemptedPassword
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
            localStorage.setItem('username', attemptedUsername);
            localStorage.setItem('loginToken', data["loginToken"]);
            alert("Login Succeed")
        }else{
            alert("Login Failure")
        }
    })
    .catch(error => {
        alert("Login Failure")
        console.error('Fetch error:', error.message);
    });
})