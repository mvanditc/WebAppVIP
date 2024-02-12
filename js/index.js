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

// Get the modal
var modal = document.getElementById("appearance-modal");

// Get the buttons that open the modal
var btn = document.getElementById("siteThemePickerNavbarbutton");
var hamburgBtn = document.getElementById("siteThemePickerHamburgbutton");

// Function to open the modal
function openModal() {
  modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
  modal.style.display = "none";
}

// Add click event listener to navbar button
btn.addEventListener("click", openModal);

// Add click event listener to hamburg button
hamburgBtn.addEventListener("click", openModal);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}


//Code for Customization Buttons
document.addEventListener("DOMContentLoaded", function() {
  // Get the regular button and the color rectangles
  var regularButton = document.querySelector(".regular-button");
  var lightButton = document.querySelector(".light-button");
  var darkButton = document.querySelector(".dark-button");
  var terminalButton = document.querySelector(".terminal-button");
  var custom1Button = document.querySelector(".custom1-button");
  var custom2Button = document.querySelector(".custom2-button");
  var colorRectangles = document.querySelectorAll(".color-rectangle");
  var rgbTexts = document.querySelectorAll(".color-box p");
  var cancelButton = document.querySelector(".button-commit.red");
  var applyButton = document.querySelector(".button-commit.green");
  var originalColors = [];


  
  // Add click event listener to the regular button
  regularButton.addEventListener("click", function() {
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
    //Change Page
    document.documentElement.style.setProperty('--background-color', '#9747FF');
    document.documentElement.style.setProperty('--secondary-color', '#FFFFFF');
    document.documentElement.style.setProperty('--all-risk', '#89B8FF');
    document.documentElement.style.setProperty('--low-risk', '#FFD600');
    document.documentElement.style.setProperty('--moderate-risk', '#FF6F1E');
    document.documentElement.style.setProperty('--high-risk', '#FF2626');
    document.documentElement.style.setProperty('--black-text', '#1E1E1E');
    document.documentElement.style.setProperty('--white-text', '#FFFFFF');
    document.documentElement.style.setProperty('--purple-text', '#6F2BA5');
    document.documentElement.style.setProperty('--blue-text', '#605DF8');
    document.documentElement.style.setProperty('--tool-close-button', '#453A00');
    document.documentElement.style.setProperty('--grey-color', '#D9D9D9');
    document.documentElement.style.setProperty('--navbar-color', '#5800B2');
    document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', '#8123E1');
    document.documentElement.style.setProperty('--navbar-list-button-color', '#605DF8');
    document.documentElement.style.setProperty('--selected-navbar-list-button-color', '#89B8FF');    
    // Change RGB
    var regularColors = [
      [151, 71, 255], [255, 255, 255], [30, 30, 30], [255, 255, 255],
      [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
      [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
      [88, 0, 178], [129, 35, 225], [96, 93, 248], [137, 184, 255]
    ];
    colorRectangles.forEach(function(rectangle, index) {
      rectangle.style.backgroundColor = `rgb(${regularColors[index].join(", ")})`;
      rgbTexts[index].textContent = `RGB(${regularColors[index].join(", ")})`;
    });


  });

  // Add click event listener to the light button
  lightButton.addEventListener("click", function() {
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
    //Change Page
    document.documentElement.style.setProperty('--background-color', '#E4CFFE');
    document.documentElement.style.setProperty('--secondary-color', '#FFFFFF');
    document.documentElement.style.setProperty('--all-risk', '#D7B0FF');
    document.documentElement.style.setProperty('--low-risk', '#9C5ADF');
    document.documentElement.style.setProperty('--moderate-risk', '#FF6F1E');
    document.documentElement.style.setProperty('--high-risk', '#FF2626');
    document.documentElement.style.setProperty('--black-text', '#1E1E1E');
    document.documentElement.style.setProperty('--white-text', '#FFFFFF');
    document.documentElement.style.setProperty('--purple-text', '#6F2BA5');
    document.documentElement.style.setProperty('--blue-text', '#605DF8');
    document.documentElement.style.setProperty('--tool-close-button', '#453A00');
    document.documentElement.style.setProperty('--grey-color', '#D9D9D9');
    document.documentElement.style.setProperty('--navbar-color', '#5800B2');
    document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', '#8123E1');
    document.documentElement.style.setProperty('--navbar-list-button-color', '#605DF8');
    document.documentElement.style.setProperty('--selected-navbar-list-button-color', '#89B8FF');
    // Change RGB
    var lightColors = [
      [228, 207, 254], [255, 255, 255], [30, 30, 30], [30, 30, 30],
      [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
      [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
      [215, 176, 255], [156, 90, 223], [96, 93, 248], [137, 184, 255]
    ];
    colorRectangles.forEach(function(rectangle, index) {
      rectangle.style.backgroundColor = `rgb(${lightColors[index].join(", ")})`;
      rgbTexts[index].textContent = `RGB(${lightColors[index].join(", ")})`;
    });
  });

  // Add click event listener to the dark button
  darkButton.addEventListener("click", function() {
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
    //Change the page
    document.documentElement.style.setProperty('--background-color', '#333333');
    document.documentElement.style.setProperty('--secondary-color', '#515151');
    document.documentElement.style.setProperty('--all-risk', '#141414');
    document.documentElement.style.setProperty('--low-risk', '#676767');
    document.documentElement.style.setProperty('--moderate-risk', '#FF6F1E');
    document.documentElement.style.setProperty('--high-risk', '#FF2626');
    document.documentElement.style.setProperty('--black-text', '#1E1E1E');
    document.documentElement.style.setProperty('--white-text', '#FFFFFF');
    document.documentElement.style.setProperty('--purple-text', '#6F2BA5');
    document.documentElement.style.setProperty('--blue-text', '#605DF8');
    document.documentElement.style.setProperty('--tool-close-button', '#453A00');
    document.documentElement.style.setProperty('--grey-color', '#D9D9D9');
    document.documentElement.style.setProperty('--navbar-color', '#5800B2');
    document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', '#8123E1');
    document.documentElement.style.setProperty('--navbar-list-button-color', '#605DF8');
    document.documentElement.style.setProperty('--selected-navbar-list-button-color', '#89B8FF');
    // Change RGB
    var darkColors = [
      [51, 51, 51], [81, 81, 81], [184, 184, 184], [30, 30, 30],
      [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
      [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
      [20, 20, 20], [103, 103, 103], [135, 135, 135], [180, 180, 180]
    ];
    colorRectangles.forEach(function(rectangle, index) {
      rectangle.style.backgroundColor = `rgb(${darkColors[index].join(", ")})`;
      rgbTexts[index].textContent = `RGB(${darkColors[index].join(", ")})`;
    });
  });

  // Add click event listener to the terminal button
  terminalButton.addEventListener("click", function() {
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

    document.documentElement.style.setProperty('--background-color', '#000000');
    document.documentElement.style.setProperty('--secondary-color', '#141414');
    document.documentElement.style.setProperty('--all-risk', '#141414');
    document.documentElement.style.setProperty('--low-risk', '#000000');
    document.documentElement.style.setProperty('--moderate-risk', '#FF6F1E');
    document.documentElement.style.setProperty('--high-risk', '#FF2626');
    document.documentElement.style.setProperty('--black-text', '#258C00');
    document.documentElement.style.setProperty('--white-text', '#258C00');
    document.documentElement.style.setProperty('--purple-text', '#6F2BA5');
    document.documentElement.style.setProperty('--blue-text', '#605DF8');
    document.documentElement.style.setProperty('--tool-close-button', '#453A00');
    document.documentElement.style.setProperty('--grey-color', '#D9D9D9');
    document.documentElement.style.setProperty('--navbar-color', '#5800B2');
    document.documentElement.style.setProperty('--selected-navbar-toplevel-button-color', '#8123E1');
    document.documentElement.style.setProperty('--navbar-list-button-color', '#605DF8');
    document.documentElement.style.setProperty('--selected-navbar-list-button-color', '#89B8FF');
    // Change RGB
    var terminalColors = [
      [0, 0, 0], [20, 20, 20], [37, 140, 0], [37, 140, 0],
      [137, 184, 255], [255, 214, 0], [255, 111, 30], [255, 38, 38],
      [111, 43, 165], [96, 93, 248], [69, 58, 0], [217, 217, 217],
      [20, 20, 20], [0, 0, 0], [43, 43, 43], [86, 86, 86]
    ];
    colorRectangles.forEach(function(rectangle, index) {
      rectangle.style.backgroundColor = `rgb(${terminalColors[index].join(", ")})`;
      rgbTexts[index].textContent = `RGB(${terminalColors[index].join(", ")})`;
    });
  });

  //Code for the Cancel and Apply buttons
  cancelButton.addEventListener("click", function() {
    // Trigger click event of regular button to reset everything to regular
    regularButton.click();
    closeModal();
  });

  applyButton.addEventListener("click", function() {
    saveCustomizations();
    closeModal();
  });


});

// Function to handle button click
function handleButtonClick(button) {
  // Reset background color of all buttons
  document.querySelectorAll('.preset-button').forEach(function(btn) {
    btn.style.backgroundColor = "";
  });

  // Set background color of the clicked button to light gray
  button.style.backgroundColor = "gray";
}

// Add click event listeners to preset buttons
document.getElementById("regularButton").addEventListener("click", function() {
  toggleColorPickers(false); // Enable color pickers
  handleButtonClick(this); // Handle button click
});

document.getElementById("lightButton").addEventListener("click", function() {
  toggleColorPickers(false); // Enable color pickers
  handleButtonClick(this); // Handle button click
});

document.getElementById("darkButton").addEventListener("click", function() {
  toggleColorPickers(false); // Enable color pickers
  handleButtonClick(this); // Handle button click
});

document.getElementById("terminalButton").addEventListener("click", function() {
  toggleColorPickers(false); // Enable color pickers
  handleButtonClick(this); // Handle button click
});

document.getElementById("custom1Button").addEventListener("click", function() {
  toggleColorPickers(true); // Enable color pickers
  handleButtonClick(this); // Handle button click
});

document.getElementById("custom2Button").addEventListener("click", function() {
  toggleColorPickers(true); // Enable color pickers
  handleButtonClick(this); // Handle button click
});

// I am going insane trying to get this working

// Function to open color picker
function openColorPicker(event) {
  const colorInput = event.target.parentElement.querySelector('input[type="color"]');
  colorInput.click();
}

// Add event listener to color rectangles to open color picker
document.querySelectorAll('.color-rectangle').forEach(rectangle => {
  rectangle.addEventListener('click', openColorPicker);
});

// Function to update the color of rectangles and RGB texts
function updateColors(color, index) {
  // Update the color of rectangle
  const colorRectangles = document.querySelectorAll('.color-rectangle');
  colorRectangles[index].style.backgroundColor = color;

  // Extract RGB values from the color string
  var rgbValues = color.match(/\d+/g);

  // Update the RGB text
  const rgbTexts = document.querySelectorAll('.color-box p');
  rgbTexts[index].textContent = `RGB(${rgbValues.join(", ")})`;

   // Update the corresponding CSS variable
   const cssVariables = [
    "--background-color",
    "--secondary-color",
    "--all-risk",
    "--low-risk",
    "--moderate-risk",
    "--high-risk",
    "--black-text",
    "--white-text",
    "--purple-text",
    "--blue-text",
    "--tool-close-button",
    "--grey-color",
    "--navbar-color",
    "--selected-navbar-toplevel-button-color",
    "--navbar-list-button-color",
    "--selected-navbar-list-button-color"
  ];

  document.documentElement.style.setProperty(cssVariables[index], color);
}

// Add event listener to color input elements
document.querySelectorAll('input[type="color"]').forEach(function(input, index) {
  input.addEventListener("input", function(event) {
    var color = event.target.value;
    updateColors(color, index);

    // Save the customization to localStorage
    saveCustomizations();
  });
});

// Check if the user has localStorage variables for currentlySelectedPreset and savedCustomPresets
if (!localStorage.getItem('currentlySelectedPreset') || !localStorage.getItem('savedCustomPresets')) {
  // If not, assign the user with the initial values
  const initialData = {
      currentlySelectedPreset: "0",
      savedCustomPresets: {
          "4": {
              "--background-color": "#9747FF",
              "--secondary-color": "#FFFFFF",
              "--all-risk": "#89B8FF",
              "--low-risk": "#FFD600",
              "--moderate-risk": "#FF6F1E",
              "--high-risk": "#FF2626",
              "--black-text": "#1e1e1e",
              "--white-text": "#FFFFFF",
              "--purple-text": "#6F2BA5",
              "--blue-text": "#605DF8",
              "--tool-close-button": "#453A00",
              "--grey-color": "#D9D9D9",
              "--navbar-color": "#5800B2",
              "--selected-navbar-toplevel-button-color": "#8123E1",
              "--navbar-list-button-color": "#605DF8",
              "--selected-navbar-list-button-color": "#89B8FF"
          },
          "5": {
              "--background-color": "#9747FF",
              "--secondary-color": "#FFFFFF",
              "--all-risk": "#89B8FF",
              "--low-risk": "#FFD600",
              "--moderate-risk": "#FF6F1E",
              "--high-risk": "#FF2626",
              "--black-text": "#1e1e1e",
              "--white-text": "#FFFFFF",
              "--purple-text": "#6F2BA5",
              "--blue-text": "#605DF8",
              "--tool-close-button": "#453A00",
              "--grey-color": "#D9D9D9",
              "--navbar-color": "#5800B2",
              "--selected-navbar-toplevel-button-color": "#8123E1",
              "--navbar-list-button-color": "#605DF8",
              "--selected-navbar-list-button-color": "#89B8FF"
          }
      }
  };

  // Set the initial values to localStorage
  localStorage.setItem('currentlySelectedPreset', initialData.currentlySelectedPreset);
  localStorage.setItem('savedCustomPresets', JSON.stringify(initialData.savedCustomPresets));
}

// Function to apply saved customizations from localStorage
function applySavedCustomizations() {
  var savedCustomPresets = JSON.parse(localStorage.getItem('savedCustomPresets'));
  var currentPreset = savedCustomPresets[currentlySelectedPreset];
  for (const [key, value] of Object.entries(currentPreset)) {
    document.documentElement.style.setProperty(key, value);
  }
}

// Call the function to apply saved customizations when the page loads
applySavedCustomizations();

