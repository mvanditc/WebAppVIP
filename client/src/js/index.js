// JavaScript used for the Homepage's Counter functionality.

const $form = document.getElementById('dataForm');

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  const url = document.getElementById('dataInput').value.trim();

  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  const isValid = regex.test(url);
  
  if (isValid) {
    window.location.href = `scanPage.html?url=${encodeURIComponent(url)}`
  }
  else {
    alert('Please enter a valid url.');
  }

})