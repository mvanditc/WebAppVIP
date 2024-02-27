let languageSelectorButton = document.getElementById("languageSelectorButton")
let languageSelectorModal = document.getElementById("languageSelectorModal")
let languageSelectorApplyButton = document.getElementById("languageSelectorApplyButton")
let languageSelectorCancelButton = document.getElementById("languageSelectorCancelButton")

let languageSelectorContent = document.getElementById("languageSelectorContent")

function closeLanguageSelectorModal(){
    languageSelectorModal.style.display = "none"
}

function openLanguageSelectorModal(){
    languageSelectorModal.style.display = ""
}

languageSelectorModal.style.display = "none"

languageSelectorButton.addEventListener("click", openLanguageSelectorModal)

languageSelectorCancelButton.addEventListener("click", closeLanguageSelectorModal)

languageSelectorApplyButton.addEventListener("click", closeLanguageSelectorModal)

languageSelectorModal.addEventListener("click", (event)=>{
    if (event.target == languageSelectorModal){
        closeLanguageSelectorModal()
    }
})