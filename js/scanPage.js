// JavaScript used for the Scanning Page's functionality.

const progressBar = document.getElementById('scanPage-progress-bar');
const finalPercentage = 100;

const increaseProgress = () => {
  for (let i = 0; i < finalPercentage + 1; i++) {
    setTimeout(() => {
      progressBar.innerHTML = "#";
    }, i * 50);
  }
}