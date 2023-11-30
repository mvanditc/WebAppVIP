// JavaScript used for the Scanning Page's functionality.

var progressBar = new AsciiProgress("scanPage-progressBar",{
  openCharacter: "[ ",
  loadedCharacter: "#",
  backgroundCharacter: "-",
  closeCharacter: " ]",
  length: 40,
  value: 0,
  completeAt: 100,
  showPercent: false,
  percentDecimalPlaces: 2,
  percentLocation: "top",
  showComment: true,
  startingComment: " ",
  commentLocation: "bottom"
});

const scanPercent = 0;
for (let i = 0; i < 101; i = i + 5) {
  setTimeout(function() {
    progressBar.setValue(i);
    progressBar.setComment(i + "%");
  },  /* i* */ 100)
}
