// JavaScript used for the Scanning Page's functionality.

var progressBar = new AsciiProgress("scanPage-progressBar",{
  openCharacter: "[ ",
  loadedCharacter: "█",
  backgroundCharacter: "  ",
  closeCharacter: " ]",
  length: 20,
  value: 0,
  completeAt: 100,
  showPercent: false,
  percentDecimalPlaces: 2,
  percentLocation: "top",
  showComment: true,
  startingComment: " ",
  commentLocation: "bottom"
});

for (let i = 0; i < 101; i++) {
  setTimeout(function() {
    progressBar.setValue(i);
    progressBar.setComment(i + "%");
  }, i * 50)
}


let minvalue = 0
let maxvalue = 10



function counter(){
  currentValue = minvalue

  while(currentValue<maxvalue){
    //time wait here
    currentvalue += 1
    // display bars
  }

}

counter();
