// JavaScript used for the Navbar/Hamburger's functionality.

navbarContainer = document.getElementById("navbarContainer");
scanNavbarButton = document.getElementById("scanNavbarbutton");
aboutUsNavbarbutton = document.getElementById("aboutUsNavbarbutton");

navbarShowing = -1
resourcesNavbarbutton = document.getElementById("resourcesNavbarbutton");
navbarChevron = document.getElementById("navbarChevron")
navbarListContainer = document.getElementById("navbarListContainer");
navbarListOpen = -1
techUsedNavbarbutton = document.getElementById("techUsedNavbarbutton")
vulnerabilityDictNavbarbutton = document.getElementById("vulnerabilityDictNavbarbutton")

hamburgShowing = -1
hamburgerContainer = document.getElementById("hamburgerContainer");
hamburgerTopLevelList = document.getElementById("hamburgerTopLevelList");
hamburgListOpen = -1

scanHamburgbutton = document.getElementById("scanHamburgbutton");
aboutUsHamburgbutton = document.getElementById("aboutUsHamburgbutton");
resourcesHamburgbutton = document.getElementById("resourcesHamburgbutton");
hamburgChevron = document.getElementById("hamburgChevron")

hamburgSubListOpen = -1
hamburgSubListContainer = document.getElementById("hamburgSubListContainer");
techUsedHamburgbutton = document.getElementById("techUsedHamburgbutton");
vulnerabilityDictHamburgbutton = document.getElementById("vulnerabilityDictHamburgbutton");

// Preseting the Navbar/Hamburger visibility
if (window.innerWidth < 765){
    navbarContainer.style.display = "none";
    hamburgerContainer.style.display = "flex";
    hamburgShowing = 1
    navbarShowing = -1
}
else{
    navbarContainer.style.display = "flex";
    hamburgerContainer.style.display = "none";
    navbarShowing = 1
    hamburgShowing = -1
}

// Window resize listener that controls navbar and hamburger visibility.
window.addEventListener("resize", ()=>{
    if (window.innerWidth < 765){
        navbarContainer.style.display = "none";
        navbarListContainer.style.display = "none"
        hamburgerContainer.style.display = "flex";
        navbarChevron.style.transform = ""
        hamburgShowing = 1
        navbarShowing = -1
        navbarListOpen = -1
        navbarListContainer.style.display = "none"
        resourcesNavbarbutton.style.backgroundColor = ""
    }
    else{
        navbarContainer.style.display = "flex";
        hamburgerContainer.style.display = "none";
        hamburgerTopLevelList.style.display = "none"
        hamburgSubListContainer.style.display = "none"
        hamburgChevron.style.transform = ""
        hamburgListOpen = -1
        hamburgSubListOpen = -1
        navbarShowing = 1
        hamburgShowing = -1
        resourcesHamburgbutton.style.backgroundColor = ""
        hamburgerContainer.style.backgroundColor = ""
    }
})

// Scan button page redirect functionality for Navbar.
scanNavbarButton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/index.html"; //redirect to index.html (Homepage)
})

// About Us button page redirect functionality for Navbar.
aboutUsNavbarbutton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/aboutUsPage.html"; //redirect to aboutUsPage.html (About Us page)
})

//    Next two event listeners (mouseenter and mouseleave) controls the color of the button when
// the sublist is open
resourcesNavbarbutton.addEventListener("mouseenter", () => {
    if (navbarListOpen == 1){
        resourcesNavbarbutton.style.backgroundColor = "var(--selected-navbar-list-button-color)"
    }else{
        resourcesNavbarbutton.style.backgroundColor = ""
    }
});
resourcesNavbarbutton.addEventListener("mouseleave", () => {
    if (navbarListOpen == 1){
        resourcesNavbarbutton.style.backgroundColor = "var(--navbar-list-button-color)"
    }else{
        resourcesNavbarbutton.style.backgroundColor = ""
    }
});

// Navbar Resources button page list visibility functionality for Navbar.
resourcesNavbarbutton.addEventListener("click", ()=>{
    if (navbarListOpen == -1){
        navbarListContainer.style.display = "flex";
        resourcesNavbarbutton.style.backgroundColor = "var(--navbar-list-button-color)"
        navbarChevron.style.transform = "rotate(180deg)"
        navbarListOpen *= -1
    }
    else if(navbarListOpen == 1){
        navbarListContainer.style.display = "none";
        resourcesNavbarbutton.style.backgroundColor = ""
        navbarChevron.style.transform = ""
        navbarListOpen *= -1
    }
})

// Technology Used button page redirect functionality for Navbar.
techUsedNavbarbutton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/techUsedPage.html"; //redirect to techUsedPage.html (Technology Used page)
})

// Vulnerability Dictionary button page redirect functionality for Navbar.
vulnerabilityDictNavbarbutton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/vulnerabilityDictPage.html"; //redirect to vulnerabilityDictPage.html (Vulnerability Dictionary page)
})

// Functionality that closes the Navbar/Hamburger lists when clicking outside of the lists.
window.addEventListener("click", (event)=>{
    if (navbarShowing == 1){
        if (event.target != resourcesNavbarbutton && navbarListOpen == 1){
            navbarListContainer.style.display = "none";
            resourcesNavbarbutton.style.backgroundColor = ""
            navbarListOpen *= -1
            navbarChevron.style.transform = ""
        }
    }
    else if(hamburgShowing == 1){
        if (
            event.target != hamburgerContainer && 
            event.target != hamburgerContainer.children[0] && 
            event.target != scanHamburgbutton && 
            event.target != aboutUsHamburgbutton && 
            event.target != resourcesHamburgbutton && 
            hamburgListOpen == 1
            ){
            hamburgerTopLevelList.style.display = "none";
            resourcesHamburgbutton.style.backgroundColor = ""
            hamburgSubListContainer.style = "none"
            hamburgChevron.style.transform = ""
            hamburgSubListOpen = -1
            hamburgListOpen = -1
        }
    }
})

// Hamburger top level list visibility functionality.
hamburgerContainer.addEventListener("click", ()=>{
    if (hamburgListOpen == -1){
        hamburgerTopLevelList.style.display = "flex";
        hamburgListOpen *= -1
    }
    else if(hamburgListOpen == 1){
        hamburgerTopLevelList.style.display = "";
        hamburgListOpen *= -1
    }
})

// Scan button page redirect functionality for Hamburger.
scanHamburgbutton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/index.html"; //redirect to index.html (Homepage)
})

// About Us button page redirect functionality for Hamburger.
aboutUsHamburgbutton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/aboutUsPage.html"; //redirect to aboutUsPage.html (About Us page)
})

// Functionality used to manage the visibility of the Resources sublist for Hamburger.
resourcesHamburgbutton.addEventListener("click", ()=>{
    if (hamburgSubListOpen == -1){
        hamburgSubListContainer.style.display = "flex";
        hamburgerTopLevelList.style.borderBottomLeftRadius = "0px"
        resourcesHamburgbutton.style.borderBottomLeftRadius = "0px"
        resourcesHamburgbutton.style.backgroundColor = "var(--navbar-list-button-color)"
        hamburgChevron.style.transform = "rotate(180deg)"
        hamburgSubListOpen *= -1
    }
    else if(hamburgSubListOpen == 1){
        hamburgSubListContainer.style.display = "";
        hamburgerTopLevelList.style.borderBottomLeftRadius = ""
        resourcesHamburgbutton.style.borderBottomLeftRadius = ""
        resourcesHamburgbutton.style.backgroundColor = ""
        hamburgChevron.style.transform = ""
        hamburgSubListOpen *= -1
    }
})

//    Next two event listeners (mouseenter and mouseleave) controls the color of the button when
// the sublist is open for Resources button in Hamburger.
resourcesHamburgbutton.addEventListener("mouseenter", () => {
    if (hamburgSubListOpen == 1){
        resourcesHamburgbutton.style.backgroundColor = "var(--selected-navbar-list-button-color)"
    }else{
        resourcesHamburgbutton.style.backgroundColor = ""
    }
});
resourcesHamburgbutton.addEventListener("mouseleave", () => {
    if (hamburgSubListOpen == 1){
        resourcesHamburgbutton.style.backgroundColor = "var(--navbar-list-button-color)"
    }else{
        resourcesHamburgbutton.style.backgroundColor = ""
    }
});

// Technology Used button page redirect functionality for Hamburger.
techUsedHamburgbutton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/techUsedPage.html"; //redirect to techUsedPage.html (Technology Used page)
})

// Vulnerability Dictionary button page redirect functionality for Hamburger.
vulnerabilityDictHamburgbutton.addEventListener("click", ()=>{
    window.location.href = "../../public/html/vulnerabilityDictPage.html"; //redirect to vulnerabilityDictPage.html (Vulnerability Dictionary page)
})
