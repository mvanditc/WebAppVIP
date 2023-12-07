// JavaScript used for the Scanning Page's functionality.

const progressBar = document.getElementById('scanPage-progressBar');
const progressBarPercentage = document.getElementById('scanPage-progressBar-percentage');

const finalPercentage = 100;
const percentageJump = 10;

let loadingSymbol = "--".repeat(Math.floor(100/percentageJump)) + 1;

const lowRisk = document.getElementById('scanPage-low-risk');
const mediumRisk = document.getElementById('scanPage-medium-risk');
const highRisk = document.getElementById('scanPage-high-risk');

const timeElapsed = document.getElementById('scanPage-time-elapsed');
let seconds = -1;
let minutes = 0;
let screenSeconds = seconds;

lowRisk.textContent = "-";
mediumRisk.textContent = "-";
highRisk.textContent = "-";

const performScan = async () => {
  for (let i = 0; i < finalPercentage + 1; i = i + percentageJump) {
    loadingSymbol = "█" + loadingSymbol;
    loadingSymbol = loadingSymbol.slice(0, -2);
    progressBar.textContent = `[ ${loadingSymbol} ]`;
    progressBarPercentage.textContent = `${i}%`;
    
    seconds += 1;
    screenSeconds += 1;
    
    if (seconds % 60 === 0) {
      screenSeconds = 0;
    }

    minutes = Math.floor(seconds/60);
    timeElapsed.textContent = `${minutes}:${screenSeconds}`

    await new Promise((resolve) => setTimeout(resolve, percentageJump*20));
  }
}

performScan().then(() => {
  lowRisk.textContent = String(1);
  mediumRisk.textContent = String(2);
  highRisk.textContent = String(3);
})