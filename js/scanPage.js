// JavaScript used for the Scanning Page's functionality.

const progressBar = document.getElementById('scanPage-progressBar');
const progressBarPercentage = document.getElementById('scanPage-progressBar-percentage');
const finalPercentage = 100;
let loadingSymbol = "--".repeat(100/5) + 1;

const timeElapsed = document.getElementById('scanPage-time-elapsed');
let seconds = 55;
let minutes = 0;

for (let i = 0; i < finalPercentage + 1; i = i + 5) {
  setTimeout(() => {
    loadingSymbol = "█" + loadingSymbol;
    loadingSymbol = loadingSymbol.slice(0, -2);
    progressBar.textContent = `[ ${loadingSymbol} ]`;
    progressBarPercentage.textContent = `${i}%`;

    seconds += 1;
    minutes = Math.floor(seconds/60);
    timeElapsed.textContent = `${minutes}:${seconds}`
  }, i * 200);
}