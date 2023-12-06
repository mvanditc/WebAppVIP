// JavaScript used for the Scanning Page's functionality.

const progressBar = document.getElementById('scanPage-progressBar');
const progressBarPercentage = document.getElementById('scanPage-progressBar-percentage');
const finalPercentage = 100;
const percentageJump = 10;

let screenWidth = window.innerWidth;  
let loadingSymbol = "--".repeat(Math.floor(100/percentageJump)) + 1;

// const updateScreenWidth = () => {
//   screenWidth = window.innerWidth;  
//   loadingSymbol = "--".repeat(Math.floor(screenWidth/30)) + 1;
// }

// updateScreenWidth();
// window.addEventListener('resize', updateScreenWidth);


const timeElapsed = document.getElementById('scanPage-time-elapsed');
let seconds = -1;
let minutes = 0;
let screenSeconds = seconds;

for (let i = 0; i < finalPercentage + 1; i = i + percentageJump) {
  setTimeout(() => {
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
  }, i * 100);
}