let languageSelectorButton = document.getElementById("languageSelectorButton")
let languageSelectorModal = document.getElementById("languageSelectorModal")
let languageSelectorApplyButton = document.getElementById("languageSelectorApplyButton")
let languageSelectorCancelButton = document.getElementById("languageSelectorCancelButton")

let languageSelectorInput = document.getElementById("languageSelectorInput")

let languageSelectorContent = document.getElementById("languageSelectorContent")

function closeLanguageSelectorModal(){
    languageSelectorModal.style.display = "none"
    languageSelectorButton.style.backgroundColor = ""
}

function openLanguageSelectorModal(){
    languageSelectorModal.style.display = ""
    languageSelectorButton.style.backgroundColor = "var(--selected-navbar-list-button-color)"
}

languageSelectorModal.style.display = "none"

languageSelectorButton.addEventListener("click", openLanguageSelectorModal)

languageSelectorCancelButton.addEventListener("click", closeLanguageSelectorModal)

languageSelectorApplyButton.addEventListener("click", ()=>{
    applyTranslation()
    //closeLanguageSelectorModal()
})

languageSelectorModal.addEventListener("click", (event)=>{
    if (event.target == languageSelectorModal){
        closeLanguageSelectorModal()
    }
})

function applyTranslation(){
    //debugger;
    
    const event = new Event("change");
    let googleTranslateElement = document.getElementById("google_translate_element")
    let googleTranslateSelect = googleTranslateElement.children[0].children[0].children[0]

    languageSelectorInput.innerHTML = googleTranslateSelect.innerHTML

    googleTranslateSelect.value = "ja"

    googleTranslateSelect.dispatchEvent(event);
}