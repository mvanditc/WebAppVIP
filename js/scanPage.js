// JavaScript used for the Scanning Page's functionality.

document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.getElementById('scanPage-progressBar');
  const progressBarPercentage = document.getElementById('scanPage-progressBar-percentage');
  const finalPercentage = 100;
  let loadingSymbol = "";
  
  for (let i = 0; i < finalPercentage + 1; i = i + 5) {
    setTimeout(() => {
      loadingSymbol += "█";
      progressBar.textContent = `[ ${loadingSymbol} ]`;
      progressBarPercentage.textContent = `${i}%`;
    }, i * 50);
  }
})