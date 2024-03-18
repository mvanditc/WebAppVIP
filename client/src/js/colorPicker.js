// Get the modal
var modal = document.getElementById("appearance-modal");

// Get the buttons that open the modal
var btn = document.getElementById("siteThemePickerNavbarbutton");
var hamburgBtn = document.getElementById("siteThemePickerHamburgbutton");

// Memory Variable for Custom Presets
var customPresetValues = null

// Memory for Current Preset Being Customized
var currentPresetBeingCustomized = null

// Color boxes that represent color inputs
var colorRectangles = document.querySelectorAll(".color-rectangle");

// RGB Color Texts under Color Input Boxes
var rgbTexts = document.querySelectorAll(".color-box p");

// RGB Color Inputs
var colorInputs = document.querySelectorAll('input[type="color"]');

// Function to open the modal
function openModal() {
  modal.style.display = "flex";
  customPresetValues = JSON.parse(localStorage.getItem('savedCustomPresets'))
}

// Function to close the modal
function closeModal() {
  modal.style.display = "none";
}

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return [r, g, b];
}

// Function to reset changes after user presses cancel button
function resetChanges() {
  let currentlySelectedPreset = localStorage.getItem('currentlySelectedPreset')

  if (currentlySelectedPreset == "regularButton"){
    changeToRegularColors()
    // Reset background color of all preset buttons
    document.querySelectorAll('.preset-button').forEach(function(btn) {
      btn.style.setProperty('background-color', ''); // Reset to default background color
    });

    // Set background color of the clicked button to grey
    document.getElementById("regularButton").style.setProperty('background-color', 'grey');
    }
  else if (currentlySelectedPreset == "lightButton"){
    changeToLightColors()
    // Reset background color of all preset buttons
    document.querySelectorAll('.preset-button').forEach(function(btn) {
      btn.style.setProperty('background-color', ''); // Reset to default background color
    });

    // Set background color of the clicked button to grey
    document.getElementById("lightButton").style.setProperty('background-color', 'grey');
  }
  else if (currentlySelectedPreset == "darkButton"){
    changeToDarkColors()
    // Reset background color of all preset buttons
    document.querySelectorAll('.preset-button').forEach(function(btn) {
      btn.style.setProperty('background-color', ''); // Reset to default background color
    });

    // Set background color of the clicked button to grey
    document.getElementById("darkButton").style.setProperty('background-color', 'grey');
  }
  else if (currentlySelectedPreset == "terminalButton"){
    changeToTerminalColors()
    // Reset background color of all preset buttons
    document.querySelectorAll('.preset-button').forEach(function(btn) {
      btn.style.setProperty('background-color', ''); // Reset to default background color
    });

    // Set background color of the clicked button to grey
    document.getElementById("terminalButton").style.setProperty('background-color', 'grey');
  }
  else if (currentlySelectedPreset == "custom1Button"){
    // Reset background color of all preset buttons
    document.querySelectorAll('.preset-button').forEach(function(btn) {
      btn.style.setProperty('background-color', ''); // Reset to default background color
    });

    // Set background color of the clicked button to grey
    document.getElementById("custom1Button").style.setProperty('background-color', 'grey');
  }
  else if (currentlySelectedPreset == "custom2Button"){
    // Reset background color of all preset buttons
    document.querySelectorAll('.preset-button').forEach(function(btn) {
      btn.style.setProperty('background-color', ''); // Reset to default background color
    });

    // Set background color of the clicked button to grey
    document.getElementById("custom2Button").style.setProperty('background-color', 'grey');
  }
}

// Add click event listener to navbar button
btn.addEventListener("click", openModal);

// Add click event listener to hamburg button
hamburgBtn.addEventListener("click", openModal);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    resetChanges();
    closeModal();
  }
}

function changeToRegularColors(){
  console.log("regular")
  // Change the color of rectangles to their regular color
  colorRectangles[0].style.backgroundColor = "#9747FF";
  colorRectangles[1].style.backgroundColor = "#FFFFFF";
  colorRectangles[2].style.backgroundColor = "#1E1E1E";
  colorRectangles[3].style.backgroundColor = "#FFFFFF";
  colorRectangles[4].style.backgroundColor = "#89B8FF";
  colorRectangles[5].style.backgroundColor = "#FFD600";
  colorRectangles[6].style.backgroundColor = "#FF6F1E";
  colorRectangles[7].style.backgroundColor = "#FF2626";
  colorRectangles[8].style.backgroundColor = "#6F2BA5";
  colorRectangles[9].style.backgroundColor = "#605DF8";
  colorRectangles[10].style.backgroundColor = "#453A00";
  colorRectangles[11].style.backgroundColor = "#D9D9D9";
  colorRectangles[12].style.backgroundColor = "#5800B2";
  colorRectangles[13].style.backgroundColor = "#8123E1";
  colorRectangles[14].style.backgroundColor = "#605DF8";
  colorRectangles[15].style.backgroundColor = "#89B8FF";
  colorRectangles[16].style.backgroundColor = "#000000";
  colorRectangles[17].style.backgroundColor = "#9747FF";
  colorRectangles[18].style.backgroundColor = "#7400e7";
  colorRectangles[19].style.backgroundColor = "#cea9ff";
  colorRectangles[20].style.backgroundColor = "#C04E4E";
  colorRectangles[21].style.backgroundColor = "#963e3e";
  colorRectangles[22].style.backgroundColor = "#b58c8c";
  //Change Page
  document.documentElement.style.setProperty('--background-color', colorRectangles[0].style.backgroundColor);
  document.documentElement.style.setProperty('--secondary-color', colorRectangles[1].style.backgroundColor);
  document.documentElement.style.setProperty('--all-risk', colorRectangles[4].style.backgroundColor);
  document.documentElement.style.setProperty('--low-risk', colorRectangles[5].style.backgroundColor);
  document.documentElement.style.setProperty('--moderate-risk', colorRectangles[6].style.backgroundColor);
  document.documentElement.style.setProperty('--high-risk', colorRectangles[7].style.backgroundColor);
  document.documentElement.style.setProperty('--black-text', colorRectangles[2].style.backgroundColor);
  document.documentElement.style.setProperty('--white-text', colorRectangles[3].style.backgroundColor);
  document.documentElement.style.setProperty('--purple-text', colorRectangles[8].style.backgroundColor);
  document.documentElement.style.setProperty('--blue-text', colorRectangles[9].style.backgroundColor);
  document.documentElement.style.setProperty('--tool-close-button', colorRectangles[10].style.backgroundColor);
  document.documentElement.style.setProperty('--grey-color', colorRectangles[11].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-color', colorRectangles[12].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', colorRectangles[13].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-list-button-color', colorRectangles[14].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-list-button-color', colorRectangles[15].style.backgroundColor);  
  document.documentElement.style.setProperty('--tertiary-color', colorRectangles[16].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button', colorRectangles[17].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-hover', colorRectangles[18].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-disabled', colorRectangles[19].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button', colorRectangles[20].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-hover', colorRectangles[21].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-disabled', colorRectangles[22].style.backgroundColor);  
  // Change RGB
  var regularColors = [
    [151, 71, 255], [255, 255, 255], [30, 30, 30], [255, 255, 255],
    [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
    [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
    [88, 0, 178], [129, 35, 225], [96, 93, 248], [137, 184, 255],
    [0, 0, 0], [151, 71, 255], [116, 0, 231], [206, 169, 255],
    [192, 78, 78], [150, 62, 62], [181, 140, 140]
  ];
  colorRectangles.forEach(function(rectangle, index) {
    rectangle.style.backgroundColor = `rgb(${regularColors[index].join(", ")})`;
    rgbTexts[index].textContent = `RGB(${regularColors[index].join(", ")})`;
  });
}

function changeToLightColors(){
  console.log("light")
  // Change the color of rectangles to their light color
  colorRectangles[0].style.backgroundColor = "#E4CFFE";
  colorRectangles[1].style.backgroundColor = "#FFFFFF";
  colorRectangles[2].style.backgroundColor = "#1E1E1E";
  colorRectangles[3].style.backgroundColor = "#1E1E1E";
  colorRectangles[4].style.backgroundColor = "#89B8FF";
  colorRectangles[5].style.backgroundColor = "#FFD600";
  colorRectangles[6].style.backgroundColor = "#FF6F1E";
  colorRectangles[7].style.backgroundColor = "#FF2626";
  colorRectangles[8].style.backgroundColor = "#6F2BA5";
  colorRectangles[9].style.backgroundColor = "#605DF8";
  colorRectangles[10].style.backgroundColor = "#453A00";
  colorRectangles[11].style.backgroundColor = "#D9D9D9";
  colorRectangles[12].style.backgroundColor = "#D7B0FF";
  colorRectangles[13].style.backgroundColor = "#9C5ADF";
  colorRectangles[14].style.backgroundColor = "#605DF8";
  colorRectangles[15].style.backgroundColor = "#89B8FF";
  colorRectangles[16].style.backgroundColor = "#000000";
  colorRectangles[17].style.backgroundColor = "#9747FF";
  colorRectangles[18].style.backgroundColor = "#7400e7";
  colorRectangles[19].style.backgroundColor = "#cea9ff";
  colorRectangles[20].style.backgroundColor = "#C04E4E";
  colorRectangles[21].style.backgroundColor = "#963e3e";
  colorRectangles[22].style.backgroundColor = "#b58c8c";
  //Change Page
  document.documentElement.style.setProperty('--background-color', colorRectangles[0].style.backgroundColor);
  document.documentElement.style.setProperty('--secondary-color', colorRectangles[1].style.backgroundColor);
  document.documentElement.style.setProperty('--all-risk', colorRectangles[4].style.backgroundColor);
  document.documentElement.style.setProperty('--low-risk', colorRectangles[5].style.backgroundColor);
  document.documentElement.style.setProperty('--moderate-risk', colorRectangles[6].style.backgroundColor);
  document.documentElement.style.setProperty('--high-risk', colorRectangles[7].style.backgroundColor);
  document.documentElement.style.setProperty('--black-text', colorRectangles[2].style.backgroundColor);
  document.documentElement.style.setProperty('--white-text', colorRectangles[3].style.backgroundColor);
  document.documentElement.style.setProperty('--purple-text', colorRectangles[8].style.backgroundColor);
  document.documentElement.style.setProperty('--blue-text', colorRectangles[9].style.backgroundColor);
  document.documentElement.style.setProperty('--tool-close-button', colorRectangles[10].style.backgroundColor);
  document.documentElement.style.setProperty('--grey-color', colorRectangles[11].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-color', colorRectangles[12].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', colorRectangles[13].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-list-button-color', colorRectangles[14].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-list-button-color', colorRectangles[15].style.backgroundColor);
  document.documentElement.style.setProperty('--tertiary-color', colorRectangles[16].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button', colorRectangles[17].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-hover', colorRectangles[18].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-disabled', colorRectangles[19].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button', colorRectangles[20].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-hover', colorRectangles[21].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-disabled', colorRectangles[22].style.backgroundColor);  
  // Change RGB
  var lightColors = [
    [228, 207, 254], [255, 255, 255], [30, 30, 30], [30, 30, 30],
    [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
    [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
    [215, 176, 255], [156, 90, 223], [96, 93, 248], [137, 184, 255],
    [0, 0, 0], [151, 71, 255], [116, 0, 231], [206, 169, 255],
    [192, 78, 78], [150, 62, 62], [181, 140, 140]
  ];
  colorRectangles.forEach(function(rectangle, index) {
    rectangle.style.backgroundColor = `rgb(${lightColors[index].join(", ")})`;
    rgbTexts[index].textContent = `RGB(${lightColors[index].join(", ")})`;
  });
}

function changeToDarkColors() {
  console.log("dark")
  // Change the color of rectangles to their dark color
  colorRectangles[0].style.backgroundColor = "#333333";
  colorRectangles[1].style.backgroundColor = "#515151";
  colorRectangles[2].style.backgroundColor = "#B8B8B8";
  colorRectangles[3].style.backgroundColor = "#1E1E1E";
  colorRectangles[4].style.backgroundColor = "#89B8FF";
  colorRectangles[5].style.backgroundColor = "#FFD600";
  colorRectangles[6].style.backgroundColor = "#FF6F1E";
  colorRectangles[7].style.backgroundColor = "#FF2626";
  colorRectangles[8].style.backgroundColor = "#6F2BA5";
  colorRectangles[9].style.backgroundColor = "#605DF8";
  colorRectangles[10].style.backgroundColor = "#453A00";
  colorRectangles[11].style.backgroundColor = "#D9D9D9";
  colorRectangles[12].style.backgroundColor = "#141414";
  colorRectangles[13].style.backgroundColor = "#676767";
  colorRectangles[14].style.backgroundColor = "#878787";
  colorRectangles[15].style.backgroundColor = "#B4B4B4";
  colorRectangles[16].style.backgroundColor = "#000000";
  colorRectangles[17].style.backgroundColor = "#9747FF";
  colorRectangles[18].style.backgroundColor = "#7400e7";
  colorRectangles[19].style.backgroundColor = "#cea9ff";
  colorRectangles[20].style.backgroundColor = "#C04E4E";
  colorRectangles[21].style.backgroundColor = "#963e3e";
  colorRectangles[22].style.backgroundColor = "#b58c8c";
  //Change the page
  document.documentElement.style.setProperty('--background-color', colorRectangles[0].style.backgroundColor);
  document.documentElement.style.setProperty('--secondary-color', colorRectangles[1].style.backgroundColor);
  document.documentElement.style.setProperty('--all-risk', colorRectangles[4].style.backgroundColor);
  document.documentElement.style.setProperty('--low-risk', colorRectangles[5].style.backgroundColor);
  document.documentElement.style.setProperty('--moderate-risk', colorRectangles[6].style.backgroundColor);
  document.documentElement.style.setProperty('--high-risk', colorRectangles[7].style.backgroundColor);
  document.documentElement.style.setProperty('--black-text', colorRectangles[2].style.backgroundColor);
  document.documentElement.style.setProperty('--white-text', colorRectangles[3].style.backgroundColor);
  document.documentElement.style.setProperty('--purple-text', colorRectangles[8].style.backgroundColor);
  document.documentElement.style.setProperty('--blue-text', colorRectangles[9].style.backgroundColor);
  document.documentElement.style.setProperty('--tool-close-button', colorRectangles[10].style.backgroundColor);
  document.documentElement.style.setProperty('--grey-color', colorRectangles[11].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-color', colorRectangles[12].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', colorRectangles[13].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-list-button-color', colorRectangles[14].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-list-button-color', colorRectangles[15].style.backgroundColor);
  document.documentElement.style.setProperty('--tertiary-color', colorRectangles[16].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button', colorRectangles[17].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-hover', colorRectangles[18].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-disabled', colorRectangles[19].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button', colorRectangles[20].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-hover', colorRectangles[21].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-disabled', colorRectangles[22].style.backgroundColor);  
  // Change RGB
  var darkColors = [
    [51, 51, 51], [81, 81, 81], [184, 184, 184], [30, 30, 30],
    [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
    [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
    [20, 20, 20], [103, 103, 103], [135, 135, 135], [180, 180, 180],
    [0, 0, 0], [151, 71, 255], [116, 0, 231], [206, 169, 255],
    [192, 78, 78], [150, 62, 62], [181, 140, 140]
  ];
  colorRectangles.forEach(function(rectangle, index) {
    rectangle.style.backgroundColor = `rgb(${darkColors[index].join(", ")})`;
    rgbTexts[index].textContent = `RGB(${darkColors[index].join(", ")})`;
  });
}

function changeToTerminalColors() {
  console.log("terminal")
  // Change the color of rectangles to their terminal color
  colorRectangles[0].style.backgroundColor = "#000000";
  colorRectangles[1].style.backgroundColor = "#141414";
  colorRectangles[2].style.backgroundColor = "#258C00";
  colorRectangles[3].style.backgroundColor = "#258C00";
  colorRectangles[4].style.backgroundColor = "#89B8FF";
  colorRectangles[5].style.backgroundColor = "#FFD600";
  colorRectangles[6].style.backgroundColor = "#FF6F1E";
  colorRectangles[7].style.backgroundColor = "#FF2626";
  colorRectangles[8].style.backgroundColor = "#6F2BA5";
  colorRectangles[9].style.backgroundColor = "#605DF8";
  colorRectangles[10].style.backgroundColor = "#453A00";
  colorRectangles[11].style.backgroundColor = "#D9D9D9";
  colorRectangles[12].style.backgroundColor = "#141414";
  colorRectangles[13].style.backgroundColor = "#000000";
  colorRectangles[14].style.backgroundColor = "#2B2B2B";
  colorRectangles[15].style.backgroundColor = "#565656";
  colorRectangles[16].style.backgroundColor = "#000000";
  colorRectangles[17].style.backgroundColor = "#9747FF";
  colorRectangles[18].style.backgroundColor = "#7400e7";
  colorRectangles[19].style.backgroundColor = "#cea9ff";
  colorRectangles[20].style.backgroundColor = "#C04E4E";
  colorRectangles[21].style.backgroundColor = "#963e3e";
  colorRectangles[22].style.backgroundColor = "#b58c8c";

  document.documentElement.style.setProperty('--background-color', colorRectangles[0].style.backgroundColor);
  document.documentElement.style.setProperty('--secondary-color', colorRectangles[1].style.backgroundColor);
  document.documentElement.style.setProperty('--all-risk', colorRectangles[4].style.backgroundColor);
  document.documentElement.style.setProperty('--low-risk', colorRectangles[5].style.backgroundColor);
  document.documentElement.style.setProperty('--moderate-risk', colorRectangles[6].style.backgroundColor);
  document.documentElement.style.setProperty('--high-risk', colorRectangles[7].style.backgroundColor);
  document.documentElement.style.setProperty('--black-text', colorRectangles[2].style.backgroundColor);
  document.documentElement.style.setProperty('--white-text', colorRectangles[3].style.backgroundColor);
  document.documentElement.style.setProperty('--purple-text', colorRectangles[8].style.backgroundColor);
  document.documentElement.style.setProperty('--blue-text', colorRectangles[9].style.backgroundColor);
  document.documentElement.style.setProperty('--tool-close-button', colorRectangles[10].style.backgroundColor);
  document.documentElement.style.setProperty('--grey-color', colorRectangles[11].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-color', colorRectangles[12].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', colorRectangles[13].style.backgroundColor);
  document.documentElement.style.setProperty('--navbar-list-button-color', colorRectangles[14].style.backgroundColor);
  document.documentElement.style.setProperty('--selected-navbar-list-button-color', colorRectangles[15].style.backgroundColor);
  document.documentElement.style.setProperty('--tertiary-color', colorRectangles[16].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button', colorRectangles[17].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-hover', colorRectangles[18].style.backgroundColor);  
  document.documentElement.style.setProperty('--submit-button-disabled', colorRectangles[19].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button', colorRectangles[20].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-hover', colorRectangles[21].style.backgroundColor);  
  document.documentElement.style.setProperty('--cancel-button-disabled', colorRectangles[22].style.backgroundColor);  

  // Change RGB
  var terminalColors = [
    [0, 0, 0], [20, 20, 20], [37, 140, 0], [37, 140, 0],
    [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
    [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
    [20, 20, 20], [0, 0, 0], [43, 43, 43], [86, 86, 86],
    [0, 0, 0], [151, 71, 255], [116, 0, 231], [206, 169, 255],
    [192, 78, 78], [150, 62, 62], [181, 140, 140]
  ];
  colorRectangles.forEach(function(rectangle, index) {
    rectangle.style.backgroundColor = `rgb(${terminalColors[index].join(", ")})`;
    rgbTexts[index].textContent = `RGB(${terminalColors[index].join(", ")})`;
  });
}

function changeToCustom1Colors(){
  console.log("custom1")
  var currentSavedCustomPresets = JSON.parse(localStorage.getItem('savedCustomPresets'))

  console.log(currentSavedCustomPresets)
  console.log(customPresetValues)
  if (JSON.stringify(currentSavedCustomPresets["custom1Button"]) === JSON.stringify(customPresetValues["custom1Button"])){
    var hexCodes = [
      currentSavedCustomPresets["custom1Button"]["--background-color"], 
      currentSavedCustomPresets["custom1Button"]["--secondary-color"],
      currentSavedCustomPresets["custom1Button"]["--black-text"],
      currentSavedCustomPresets["custom1Button"]["--white-text"],
      currentSavedCustomPresets["custom1Button"]["--all-risk"],
      currentSavedCustomPresets["custom1Button"]["--low-risk"],
      currentSavedCustomPresets["custom1Button"]["--moderate-risk"],
      currentSavedCustomPresets["custom1Button"]["--high-risk"], 
      currentSavedCustomPresets["custom1Button"]["--purple-text"],
      currentSavedCustomPresets["custom1Button"]["--blue-text"],
      currentSavedCustomPresets["custom1Button"]["--tool-close-button"], 
      currentSavedCustomPresets["custom1Button"]["--grey-color"], 
      currentSavedCustomPresets["custom1Button"]["--navbar-color"],
      currentSavedCustomPresets["custom1Button"]["--selected-navbar-toplevel-button-color"], 
      currentSavedCustomPresets["custom1Button"]["--navbar-list-button-color"],
      currentSavedCustomPresets["custom1Button"]["--selected-navbar-list-button-color"],
      currentSavedCustomPresets["custom1Button"]["--tertiary-color"], 
      currentSavedCustomPresets["custom1Button"]["--submit-button"], 
      currentSavedCustomPresets["custom1Button"]["--submit-button-hover"], 
      currentSavedCustomPresets["custom1Button"]["--submit-button-disabled"], 
      currentSavedCustomPresets["custom1Button"]["--cancel-button"], 
      currentSavedCustomPresets["custom1Button"]["--cancel-button-hover"], 
      currentSavedCustomPresets["custom1Button"]["--cancel-button-disabled"], 
    ];
  }else{
    var hexCodes = [
      customPresetValues["custom1Button"]["--background-color"], 
      customPresetValues["custom1Button"]["--secondary-color"],
      customPresetValues["custom1Button"]["--black-text"],
      customPresetValues["custom1Button"]["--white-text"],
      customPresetValues["custom1Button"]["--all-risk"],
      customPresetValues["custom1Button"]["--low-risk"],
      customPresetValues["custom1Button"]["--moderate-risk"],
      customPresetValues["custom1Button"]["--high-risk"], 
      customPresetValues["custom1Button"]["--purple-text"],
      customPresetValues["custom1Button"]["--blue-text"],
      customPresetValues["custom1Button"]["--tool-close-button"], 
      customPresetValues["custom1Button"]["--grey-color"], 
      customPresetValues["custom1Button"]["--navbar-color"],
      customPresetValues["custom1Button"]["--selected-navbar-toplevel-button-color"], 
      customPresetValues["custom1Button"]["--navbar-list-button-color"],
      customPresetValues["custom1Button"]["--selected-navbar-list-button-color"], 
      customPresetValues["custom1Button"]["--tertiary-color"], 
      customPresetValues["custom1Button"]["--submit-button"], 
      customPresetValues["custom1Button"]["--submit-button-hover"], 
      customPresetValues["custom1Button"]["--submit-button-disabled"], 
      customPresetValues["custom1Button"]["--cancel-button"], 
      customPresetValues["custom1Button"]["--cancel-button-hover"], 
      customPresetValues["custom1Button"]["--cancel-button-disabled"], 
    ];
  }

  // Change the color of rectangles to their light color
  colorRectangles[0].style.backgroundColor = hexCodes[0];
  colorRectangles[1].style.backgroundColor = hexCodes[1];
  colorRectangles[2].style.backgroundColor = hexCodes[2];
  colorRectangles[3].style.backgroundColor = hexCodes[3];
  colorRectangles[4].style.backgroundColor = hexCodes[4];
  colorRectangles[5].style.backgroundColor = hexCodes[5];
  colorRectangles[6].style.backgroundColor = hexCodes[6];
  colorRectangles[7].style.backgroundColor = hexCodes[7];
  colorRectangles[8].style.backgroundColor = hexCodes[8];
  colorRectangles[9].style.backgroundColor = hexCodes[9];
  colorRectangles[10].style.backgroundColor = hexCodes[10];
  colorRectangles[11].style.backgroundColor = hexCodes[11];
  colorRectangles[12].style.backgroundColor = hexCodes[12];
  colorRectangles[13].style.backgroundColor = hexCodes[13];
  colorRectangles[14].style.backgroundColor = hexCodes[14];
  colorRectangles[15].style.backgroundColor = hexCodes[15];
  colorRectangles[16].style.backgroundColor = hexCodes[16];
  colorRectangles[17].style.backgroundColor = hexCodes[17];
  colorRectangles[18].style.backgroundColor = hexCodes[18];
  colorRectangles[19].style.backgroundColor = hexCodes[19];
  colorRectangles[20].style.backgroundColor = hexCodes[20];
  colorRectangles[21].style.backgroundColor = hexCodes[21];
  colorRectangles[22].style.backgroundColor = hexCodes[22];

  //Change Page
  document.documentElement.style.setProperty('--background-color', hexCodes[0]);
  document.documentElement.style.setProperty('--secondary-color', hexCodes[1]);
  document.documentElement.style.setProperty('--all-risk', hexCodes[4]);
  document.documentElement.style.setProperty('--low-risk', hexCodes[5]);
  document.documentElement.style.setProperty('--moderate-risk', hexCodes[6]);
  document.documentElement.style.setProperty('--high-risk', hexCodes[7]);
  document.documentElement.style.setProperty('--black-text', hexCodes[2]);
  document.documentElement.style.setProperty('--white-text', hexCodes[3]);
  document.documentElement.style.setProperty('--purple-text', hexCodes[8]);
  document.documentElement.style.setProperty('--blue-text', hexCodes[9]);
  document.documentElement.style.setProperty('--tool-close-button', hexCodes[10]);
  document.documentElement.style.setProperty('--grey-color', hexCodes[11]);
  document.documentElement.style.setProperty('--navbar-color', hexCodes[12]);
  document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', hexCodes[13]);
  document.documentElement.style.setProperty('--navbar-list-button-color', hexCodes[14]);
  document.documentElement.style.setProperty('--selected-navbar-list-button-color', hexCodes[15]);
  document.documentElement.style.setProperty('--tertiary-color', hexCodes[16]);  
  document.documentElement.style.setProperty('--submit-button', hexCodes[17]);  
  document.documentElement.style.setProperty('--submit-button-hover', hexCodes[18]);  
  document.documentElement.style.setProperty('--submit-button-disabled', hexCodes[19]);  
  document.documentElement.style.setProperty('--cancel-button', hexCodes[20]);  
  document.documentElement.style.setProperty('--cancel-button-hover', hexCodes[21]);  
  document.documentElement.style.setProperty('--cancel-button-disabled', hexCodes[22]);  

  // Change RGB
  var lightColors = [
    hex2rgb(hexCodes[0]), 
    hex2rgb(hexCodes[1]),
    hex2rgb(hexCodes[2]),
    hex2rgb(hexCodes[3]),
    hex2rgb(hexCodes[4]),
    hex2rgb(hexCodes[5]),
    hex2rgb(hexCodes[6]),
    hex2rgb(hexCodes[7]),
    hex2rgb(hexCodes[8]),
    hex2rgb(hexCodes[9]),
    hex2rgb(hexCodes[10]),
    hex2rgb(hexCodes[11]),
    hex2rgb(hexCodes[12]),
    hex2rgb(hexCodes[13]),
    hex2rgb(hexCodes[14]),
    hex2rgb(hexCodes[15]),
    hex2rgb(hexCodes[16]),
    hex2rgb(hexCodes[17]),
    hex2rgb(hexCodes[18]),
    hex2rgb(hexCodes[19]),
    hex2rgb(hexCodes[20]),
    hex2rgb(hexCodes[21]),
    hex2rgb(hexCodes[22])
  ];

  colorRectangles.forEach(function(rectangle, index) {
    rectangle.style.backgroundColor = `rgb(${lightColors[index].join(", ")})`;
    rgbTexts[index].textContent = `RGB(${lightColors[index].join(", ")})`;
  });

  colorInputs.forEach((input, index) => {
    input.value = hexCodes[index];
  });
}

function changeToCustom2Colors(){
  console.log("custom2")
  var currentSavedCustomPresets = JSON.parse(localStorage.getItem('savedCustomPresets'))

  if (JSON.stringify(currentSavedCustomPresets["custom2Button"]) === JSON.stringify(customPresetValues["custom2Button"])){
    var hexCodes = [
      currentSavedCustomPresets["custom2Button"]["--background-color"], 
      currentSavedCustomPresets["custom2Button"]["--secondary-color"],
      currentSavedCustomPresets["custom2Button"]["--black-text"],
      currentSavedCustomPresets["custom2Button"]["--white-text"],
      currentSavedCustomPresets["custom2Button"]["--all-risk"],
      currentSavedCustomPresets["custom2Button"]["--low-risk"],
      currentSavedCustomPresets["custom2Button"]["--moderate-risk"],
      currentSavedCustomPresets["custom2Button"]["--high-risk"], 
      currentSavedCustomPresets["custom2Button"]["--purple-text"],
      currentSavedCustomPresets["custom2Button"]["--blue-text"],
      currentSavedCustomPresets["custom2Button"]["--tool-close-button"], 
      currentSavedCustomPresets["custom2Button"]["--grey-color"], 
      currentSavedCustomPresets["custom2Button"]["--navbar-color"],
      currentSavedCustomPresets["custom2Button"]["--selected-navbar-toplevel-button-color"], 
      currentSavedCustomPresets["custom2Button"]["--navbar-list-button-color"],
      currentSavedCustomPresets["custom2Button"]["--selected-navbar-list-button-color"], 
      currentSavedCustomPresets["custom2Button"]["--tertiary-color"], 
      currentSavedCustomPresets["custom2Button"]["--submit-button"], 
      currentSavedCustomPresets["custom2Button"]["--submit-button-hover"], 
      currentSavedCustomPresets["custom2Button"]["--submit-button-disabled"], 
      currentSavedCustomPresets["custom2Button"]["--cancel-button"], 
      currentSavedCustomPresets["custom2Button"]["--cancel-button-hover"], 
      currentSavedCustomPresets["custom2Button"]["--cancel-button-disabled"], 
    ];
  }else{
    var hexCodes = [
      customPresetValues["custom2Button"]["--background-color"], 
      customPresetValues["custom2Button"]["--secondary-color"],
      customPresetValues["custom2Button"]["--black-text"],
      customPresetValues["custom2Button"]["--white-text"],
      customPresetValues["custom2Button"]["--all-risk"],
      customPresetValues["custom2Button"]["--low-risk"],
      customPresetValues["custom2Button"]["--moderate-risk"],
      customPresetValues["custom2Button"]["--high-risk"], 
      customPresetValues["custom2Button"]["--purple-text"],
      customPresetValues["custom2Button"]["--blue-text"],
      customPresetValues["custom2Button"]["--tool-close-button"], 
      customPresetValues["custom2Button"]["--grey-color"], 
      customPresetValues["custom2Button"]["--navbar-color"],
      customPresetValues["custom2Button"]["--selected-navbar-toplevel-button-color"], 
      customPresetValues["custom2Button"]["--navbar-list-button-color"],
      customPresetValues["custom2Button"]["--selected-navbar-list-button-color"], 
      customPresetValues["custom2Button"]["--tertiary-color"], 
      customPresetValues["custom2Button"]["--submit-button"], 
      customPresetValues["custom2Button"]["--submit-button-hover"], 
      customPresetValues["custom2Button"]["--submit-button-disabled"], 
      customPresetValues["custom2Button"]["--cancel-button"], 
      customPresetValues["custom2Button"]["--cancel-button-hover"], 
      customPresetValues["custom2Button"]["--cancel-button-disabled"], 
    ];
  }

  var hexCodes = [
    currentSavedCustomPresets["custom2Button"]["--background-color"], 
    currentSavedCustomPresets["custom2Button"]["--secondary-color"],
    currentSavedCustomPresets["custom2Button"]["--black-text"],
    currentSavedCustomPresets["custom2Button"]["--white-text"],
    currentSavedCustomPresets["custom2Button"]["--all-risk"],
    currentSavedCustomPresets["custom2Button"]["--low-risk"],
    currentSavedCustomPresets["custom2Button"]["--moderate-risk"],
    currentSavedCustomPresets["custom2Button"]["--high-risk"], 
    currentSavedCustomPresets["custom2Button"]["--purple-text"],
    currentSavedCustomPresets["custom2Button"]["--blue-text"],
    currentSavedCustomPresets["custom2Button"]["--tool-close-button"], 
    currentSavedCustomPresets["custom2Button"]["--grey-color"], 
    currentSavedCustomPresets["custom2Button"]["--navbar-color"],
    currentSavedCustomPresets["custom2Button"]["--selected-navbar-toplevel-button-color"], 
    currentSavedCustomPresets["custom2Button"]["--navbar-list-button-color"],
    currentSavedCustomPresets["custom2Button"]["--selected-navbar-list-button-color"], 
    currentSavedCustomPresets["custom2Button"]["--tertiary-color"], 
    currentSavedCustomPresets["custom2Button"]["--submit-button"], 
    currentSavedCustomPresets["custom2Button"]["--submit-button-hover"], 
    currentSavedCustomPresets["custom2Button"]["--submit-button-disabled"], 
    currentSavedCustomPresets["custom2Button"]["--cancel-button"], 
    currentSavedCustomPresets["custom2Button"]["--cancel-button-hover"], 
    currentSavedCustomPresets["custom2Button"]["--cancel-button-disabled"], 
  ];

  // Change the color of rectangles to their light color
  colorRectangles[0].style.backgroundColor = hexCodes[0];
  colorRectangles[1].style.backgroundColor = hexCodes[1];
  colorRectangles[2].style.backgroundColor = hexCodes[2];
  colorRectangles[3].style.backgroundColor = hexCodes[3];
  colorRectangles[4].style.backgroundColor = hexCodes[4];
  colorRectangles[5].style.backgroundColor = hexCodes[5];
  colorRectangles[6].style.backgroundColor = hexCodes[6];
  colorRectangles[7].style.backgroundColor = hexCodes[7];
  colorRectangles[8].style.backgroundColor = hexCodes[8];
  colorRectangles[9].style.backgroundColor = hexCodes[9];
  colorRectangles[10].style.backgroundColor = hexCodes[10];
  colorRectangles[11].style.backgroundColor = hexCodes[11];
  colorRectangles[12].style.backgroundColor = hexCodes[12];
  colorRectangles[13].style.backgroundColor = hexCodes[13];
  colorRectangles[14].style.backgroundColor = hexCodes[14];
  colorRectangles[15].style.backgroundColor = hexCodes[15];
  colorRectangles[16].style.backgroundColor = hexCodes[16];
  colorRectangles[17].style.backgroundColor = hexCodes[17];
  colorRectangles[18].style.backgroundColor = hexCodes[18];
  colorRectangles[19].style.backgroundColor = hexCodes[19];
  colorRectangles[20].style.backgroundColor = hexCodes[20];
  colorRectangles[21].style.backgroundColor = hexCodes[21];
  colorRectangles[22].style.backgroundColor = hexCodes[22];

  //Change Page
  document.documentElement.style.setProperty('--background-color', hexCodes[0]);
  document.documentElement.style.setProperty('--secondary-color', hexCodes[1]);
  document.documentElement.style.setProperty('--all-risk', hexCodes[4]);
  document.documentElement.style.setProperty('--low-risk', hexCodes[5]);
  document.documentElement.style.setProperty('--moderate-risk', hexCodes[6]);
  document.documentElement.style.setProperty('--high-risk', hexCodes[7]);
  document.documentElement.style.setProperty('--black-text', hexCodes[2]);
  document.documentElement.style.setProperty('--white-text', hexCodes[3]);
  document.documentElement.style.setProperty('--purple-text', hexCodes[8]);
  document.documentElement.style.setProperty('--blue-text', hexCodes[9]);
  document.documentElement.style.setProperty('--tool-close-button', hexCodes[10]);
  document.documentElement.style.setProperty('--grey-color', hexCodes[11]);
  document.documentElement.style.setProperty('--navbar-color', hexCodes[12]);
  document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', hexCodes[13]);
  document.documentElement.style.setProperty('--navbar-list-button-color', hexCodes[14]);
  document.documentElement.style.setProperty('--selected-navbar-list-button-color', hexCodes[15]);
  document.documentElement.style.setProperty('--tertiary-color', hexCodes[16]);  
  document.documentElement.style.setProperty('--submit-button', hexCodes[17]);  
  document.documentElement.style.setProperty('--submit-button-hover', hexCodes[18]);  
  document.documentElement.style.setProperty('--submit-button-disabled', hexCodes[19]);  
  document.documentElement.style.setProperty('--cancel-button', hexCodes[20]);  
  document.documentElement.style.setProperty('--cancel-button-hover', hexCodes[21]);  
  document.documentElement.style.setProperty('--cancel-button-disabled', hexCodes[22]);  

  // Change RGB
  var lightColors = [
    hex2rgb(hexCodes[0]), 
    hex2rgb(hexCodes[1]),
    hex2rgb(hexCodes[2]),
    hex2rgb(hexCodes[3]),
    hex2rgb(hexCodes[4]),
    hex2rgb(hexCodes[5]),
    hex2rgb(hexCodes[6]),
    hex2rgb(hexCodes[7]),
    hex2rgb(hexCodes[8]),
    hex2rgb(hexCodes[9]),
    hex2rgb(hexCodes[10]),
    hex2rgb(hexCodes[11]),
    hex2rgb(hexCodes[12]),
    hex2rgb(hexCodes[13]),
    hex2rgb(hexCodes[14]),
    hex2rgb(hexCodes[15]),
    hex2rgb(hexCodes[16]),
    hex2rgb(hexCodes[17]),
    hex2rgb(hexCodes[18]),
    hex2rgb(hexCodes[19]),
    hex2rgb(hexCodes[20]),
    hex2rgb(hexCodes[21]),
    hex2rgb(hexCodes[22])
  ];

  colorRectangles.forEach(function(rectangle, index) {
    rectangle.style.backgroundColor = `rgb(${lightColors[index].join(", ")})`;
    rgbTexts[index].textContent = `RGB(${lightColors[index].join(", ")})`;
  });

  colorInputs.forEach((input, index) => {
    input.value = hexCodes[index];
  });
}

function handleLoadingColorPresets() {
  // Check if the user has localStorage variables for currentlySelectedPreset and savedCustomPresets
  if (!localStorage.getItem('currentlySelectedPreset') || !localStorage.getItem('savedCustomPresets')) {
    // If not, assign the user with the initial values
    //"--background-color" : "#9747FF",
    //
    const initialData = {
      currentlySelectedPreset: "regularButton",
      savedCustomPresets: {
        custom1Button : {
          "--background-color" : "#FFFFFF",
          "--secondary-color" : "#FFFFFF",
          "--all-risk" : "#89B8FF",
          "--low-risk" : "#FFD600",
          "--moderate-risk" : "#FF6F1E",
          "--high-risk" : "#FF2626",
          "--black-text" : "#1e1e1e",
          "--white-text" : "#FFFFFF",
          "--purple-text" : "#6F2BA5",
          "--blue-text" : "#605DF8",
          "--tool-close-button" : "#453A00",
          "--grey-color" : "#D9D9D9",
          "--navbar-color" : "#5800B2",
          "--selected-navbar-toplevel-button-color" : "#8123E1",
          "--navbar-list-button-color" : "#605DF8",
          "--selected-navbar-list-button-color" : "#89B8FF",
          "--tertiary-color": "#000000",
          "--submit-button": "#9747FF",
          "--submit-button-hover": "#7400e7",
          "--submit-button-disabled": "#cea9ff",
          "--cancel-button": "#C04E4E",
          "--cancel-button-hover": "#963e3e",
          "--cancel-button-disabled": "#b58c8c"
        },
        custom2Button : {
          "--background-color" : "#000000",
          "--secondary-color" : "#FFFFFF",
          "--all-risk" : "#89B8FF",
          "--low-risk" : "#FFD600",
          "--moderate-risk" : "#FF6F1E",
          "--high-risk" : "#FF2626",
          "--black-text" : "#1e1e1e",
          "--white-text" : "#FFFFFF",
          "--purple-text" : "#6F2BA5",
          "--blue-text" : "#605DF8",
          "--tool-close-button" : "#453A00",
          "--grey-color" : "#D9D9D9",
          "--navbar-color" : "#5800B2",
          "--selected-navbar-toplevel-button-color" : "#8123E1",
          "--navbar-list-button-color" : "#605DF8",
          "--selected-navbar-list-button-color" : "#89B8FF",
          "--tertiary-color": "#000000",
          "--submit-button": "#9747FF",
          "--submit-button-hover": "#7400e7",
          "--submit-button-disabled": "#cea9ff",
          "--cancel-button": "#C04E4E",
          "--cancel-button-hover": "#963e3e",
          "--cancel-button-disabled": "#b58c8c"
        }
      }
    }
    localStorage.setItem('currentlySelectedPreset', initialData.currentlySelectedPreset);
    localStorage.setItem('savedCustomPresets', JSON.stringify(initialData.savedCustomPresets));
  }

  let currentlySelectedPreset = localStorage.getItem('currentlySelectedPreset');

  if (currentlySelectedPreset == "regularButton"){
    changeToRegularColors();
  }else if (currentlySelectedPreset == "lightButton"){
    changeToLightColors();
  }else if (currentlySelectedPreset == "darkButton"){
    changeToDarkColors();
  }else if (currentlySelectedPreset == "terminalButton"){
    changeToTerminalColors();
  }else if (currentlySelectedPreset == "custom1Button"){
    changeToCustom1Colors();
  }else if (currentlySelectedPreset == "custom2Button"){
    changeToCustom2Colors();
  }
}

// Add event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOMDONELOADING")

  customPresetValues = JSON.parse(localStorage.getItem('savedCustomPresets'))

  // Get the regular button and the color rectangles
  var regularButton = document.querySelector(".regular-button");
  var lightButton = document.querySelector(".light-button");
  var darkButton = document.querySelector(".dark-button");
  var terminalButton = document.querySelector(".terminal-button");
  var custom1Button = document.querySelector(".custom1-button");
  var custom2Button = document.querySelector(".custom2-button");
  var cancelButton = document.querySelector(".button-commit.red");
  var applyButton = document.querySelector(".button-commit.green");

  handleLoadingColorPresets()

  // Add click event listener to the regular button
  regularButton.addEventListener("click", changeToRegularColors);

  // Add click event listener to the light button
  lightButton.addEventListener("click", changeToLightColors);

  // Add click event listener to the dark button
  darkButton.addEventListener("click", changeToDarkColors);

  // Add click event listener to the terminal button
  terminalButton.addEventListener("click", changeToTerminalColors);

  // Add click event listener to the custom slot 1 button
  custom1Button.addEventListener("click", changeToCustom1Colors);

  // Add click event listener to the custom slot 2 button
  custom2Button.addEventListener("click", changeToCustom2Colors);

  //Code for the Cancel and Apply buttons
  cancelButton.addEventListener("click", function() {
    // Trigger click event of cancel
    resetChanges();
    closeModal();
  });

  applyButton.addEventListener("click", function() {
    saveCustomizations();
    closeModal();
  });
});

// Function to handle button click
function handleButtonClick(button) {
    // Reset background color of all preset buttons
    document.querySelectorAll('.preset-button').forEach(function(btn) {
        btn.style.setProperty('background-color', ''); // Reset to default background color
    });

    // Set background color of the clicked button to grey
    button.style.setProperty('background-color', 'grey');
    
}

// Add click event listeners to preset buttons
document.getElementById("regularButton").addEventListener("click", function() {
    handleButtonClick(this); // Handle button click
});

document.getElementById("lightButton").addEventListener("click", function() {
    handleButtonClick(this); // Handle button click
});

document.getElementById("darkButton").addEventListener("click", function() {
    handleButtonClick(this); // Handle button click
});

document.getElementById("terminalButton").addEventListener("click", function() {
    handleButtonClick(this); // Handle button click
});

document.getElementById("custom1Button").addEventListener("click", function() {
    handleButtonClick(this); // Handle button click
});

document.getElementById("custom2Button").addEventListener("click", function() {
    handleButtonClick(this); // Handle button click
});

// Function to open color picker
function openColorPicker(event) {
  console.log(customPresetValues)

  const colorInput = event.target.parentElement.querySelector('input[type="color"]');

  console.log(colorInput.value)
  console.log(colorInputs)
  
  // Check if either "Custom Slot 1" or "Custom Slot 2" is selected
  const custom1Selected = document.getElementById("custom1Button").style.backgroundColor === 'grey';
  const custom2Selected = document.getElementById("custom2Button").style.backgroundColor === 'grey';

  // Open the color picker only if one of the custom slots is selected
  if (custom1Selected) {
    currentPresetBeingCustomized = 1;
    colorInput.click();
  }else if(custom2Selected){
    currentPresetBeingCustomized = 2;
    colorInput.click();
  }
}
  
// Add event listener to color rectangles to open color picker
document.querySelectorAll('.color-rectangle').forEach(rectangle => {
  rectangle.addEventListener('click', openColorPicker);
});

// Add event listener to color input elements
document.querySelectorAll('input[type="color"]').forEach(function(input, index) {
  input.addEventListener("input", function(event) {
    console.log("CHANGED COLOR INPUT VALUE")
    var color = event.target.value;
    updateColors(color, index);

    if (index == 0){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--background-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--background-color"] = color;
      }
    }else if (index == 1){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--secondary-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--secondary-color"] = color;
      }
    }else if (index == 2){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--black-text"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--black-text"] = color;
      }
    }else if (index == 3){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--white-text"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--white-text"] = color;
      }
    }else if (index == 4){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--all-risk"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--all-risk"] = color;
      }
    }else if (index == 5){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--low-risk"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--low-risk"] = color;
      }
    }else if (index == 6){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--moderate-risk"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--moderate-risk"] = color;
      }
    }else if (index == 7){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--high-risk"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--high-risk"] = color;
      }
    }else if (index == 8){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--purple-text"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--purple-text"] = color;
      }
    }else if (index == 9){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--blue-text"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--blue-text"] = color;
      }
    }else if (index == 10){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--tool-close-button"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--tool-close-button"] = color;
      }
    }else if (index == 11){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--grey-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--grey-color"] = color;
      }
    }else if (index == 12){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--navbar-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--navbar-color"] = color;
      }
    }else if (index == 13){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--selected-navbar-toplevel-button-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--selected-navbar-toplevel-button-color"] = color;
      }
    }else if (index == 14){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--navbar-list-button-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--navbar-list-button-color"] = color;
      }
    }else if (index == 15){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--selected-navbar-list-button-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--selected-navbar-list-button-color"] = color;
      }
    }else if (index == 16){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--tertiary-color"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--tertiary-color"] = color;
      }
    }else if (index == 17){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--submit-button"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--submit-button"] = color;
      }
    }else if (index == 18){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--submit-button-hover"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--submit-button-hover"] = color;
      }
    }else if (index == 19){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--submit-button-disabled"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--submit-button-disabled"] = color;
      }
    }else if (index == 20){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--cancel-button"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--cancel-button"] = color;
      }
    }else if (index == 21){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--cancel-button-hover"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--cancel-button-hover"] = color;
      }
    }else if (index == 22){
      if (currentPresetBeingCustomized == 1){
        customPresetValues["custom1Button"]["--cancel-button-disabled"] = color;
      }else if (currentPresetBeingCustomized == 2){
        customPresetValues["custom2Button"]["--cancel-button-disabled"] = color;
      }
    }
  });
});

// Function to update the color of rectangles and RGB texts
function updateColors(color, index) {
  // Update the color of rectangle
  const colorRectangles = document.querySelectorAll('.color-rectangle');
  colorRectangles[index].style.backgroundColor = color;

  // Extract RGB values from the color hex string
  var rgbValues = hex2rgb(color);

  // Update the RGB text
  const rgbTexts = document.querySelectorAll('.color-box p');
  rgbTexts[index].textContent = `RGB(${rgbValues.join(", ")})`;

   // Update the corresponding CSS variable
   const cssVariables = [
    "--background-color",
    "--secondary-color",
    "--black-text",
    "--white-text",
    "--all-risk",
    "--low-risk",
    "--moderate-risk",
    "--high-risk",
    "--purple-text",
    "--blue-text",
    "--tool-close-button",
    "--grey-color",
    "--navbar-color",
    "--selected-navbar-toplevel-button-color",
    "--navbar-list-button-color",
    "--selected-navbar-list-button-color",
    "--tertiary-color",
    "--submit-button",
    "--submit-button-hover",
    "--submit-button-disabled",
    "--cancel-button",
    "--cancel-button-hover",
    "--cancel-button-disabled",
  ];

  document.documentElement.style.setProperty(cssVariables[index], color);
}


// Function to save the customization to localStorage
function saveCustomizations() {
  // This function runs when user clicks save

  // Get the selected preset button
  const selectedPresetButton = document.querySelector('.preset-button[style="background-color: grey;"]');
  const currentlySelectedPreset = selectedPresetButton ? selectedPresetButton.id : "regularButton";

  // Save the data to localStorage
  localStorage.setItem('savedCustomPresets', JSON.stringify(customPresetValues));
  localStorage.setItem('currentlySelectedPreset', currentlySelectedPreset);
  closeModal();
}