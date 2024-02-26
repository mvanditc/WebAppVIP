document.addEventListener("DOMContentLoaded", (event)=>{
    let attemptedUsername = localStorage.getItem('username');
    let attemptedToken = localStorage.getItem('loginToken');

    fetch("http://localhost:3022/attempt-authentication", {
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
        console.log('Data from the backend:', data);
        if (data["status"] != "success"){
            window.location.href = '../html/accessDenied.html';
        }else{
            alert("Welcome Admin!")
        }
    })
    .catch(error => {
        console.error('Fetch error:', error.message);
        window.location.href = '../html/accessDenied.html';
    });
})