// JavaScript used for the Homepage's Counter functionality.

//Basic counter//
let counter = 0;

function incrementCounter() {
  counter++;
  document.getElementById('counter').innerText = counter;
}

//Scanner Input
function enableInput() {
  const inputText = document.getElementById('inputText');
  inputText.style.display = 'block';
  inputText.focus();
}

function disableInput() {
  const inputText = document.getElementById('inputText');
  inputText.style.display = 'none';
}


