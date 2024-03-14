document.addEventListener("DOMContentLoaded", (event)=>{
  let attemptedUsername = sessionStorage.getItem('username');
  let attemptedToken = sessionStorage.getItem('loginToken');

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
      console.log('Data from the backend:', data);
      if (data["status"] != "success"){
        alert("UNSUCCESSFUL STATUS: ", data["status"])
        window.location.href = '../../public/html/accessDenied.html';
      }else{
          alert("Welcome Admin!")
      }
  })
  .catch(error => {
      console.error('Fetch error:', error.message);
      window.location.href = '../../public/html/accessDenied.html';
  });
})