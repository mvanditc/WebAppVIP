// JavaScript used for the Result Page's functionality.
// Sample data
let issues = [];

async function fetchInfo(){
    let fetchedIssues = [];
    await fetch('http://localhost:8800/returnScanIds',
    {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(vulnerability => {
            for (let x = 0; x < vulnerability.length; x++){
                if (vulnerability[x] == null){
                    vulnerability[x] = 'N/A';
                }
            }
            if (typeof vulnerability[2] == "string") {
                // zap returns the risk level as medium so turn it into moderate to display as moderate
                if (vulnerability[3] == "Medium") vulnerability[3] = "Moderate";
                let temp_dict = {
                    id: vulnerability[0],
                    title: vulnerability[1],
                    url: vulnerability[2],
                    riskLevel: vulnerability[3],
                    description: vulnerability[4],
                    actionableSteps: vulnerability[5],
                    dateScanned: vulnerability[6],
                    highConfidence: [],
                    mediumConfidence: [],
                    lowConfidence: [],
                };
                fetchedIssues.push(temp_dict);

            } else{
                if (vulnerability[3] == "Medium") vulnerability[3] = "Moderate";
                let temp_dict = {
                    id: vulnerability[0],
                    title: vulnerability[1],
                    url: vulnerability[2][0],
                    riskLevel: vulnerability[3],
                    description: vulnerability[4],
                    actionableSteps: vulnerability[5],
                    dateScanned: vulnerability[6],
                    highConfidence: [],
                    mediumConfidence: [],
                    lowConfidence: [],
                };
                fetchedIssues.push(temp_dict);
            }
                
        })
    })
    .catch(error => console.error('Error fetching data:', error));

await fetch('http://localhost:8800/returnInfo',
    {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        for (let key in data) {
            fetchedIssues.forEach((issue) => {
                if (key == issue.id) {
                    let temp = data[key];
                    issue.highConfidence = temp.highConfidence;
                    issue.lowConfidence = temp.lowConfidence;
                    issue.mediumConfidence = temp.mediumConfidence;
                }
            });
        }
    }).catch(error => console.error('Error fetching data:', error));

    return fetchedIssues;
}




const scanCoverageData = {
    testsPerformed: [],

    scanParameters: {},
};

function populateScanCoverageData(){
    let tempArray;
    issues.forEach((issue) => {
        scanCoverageData.testsPerformed.push('Testing for ' + issue.title);
        tempArray = allSubpages(issue);
        if (tempArray.length >=3) tempArray = [tempArray[0],tempArray[1],tempArray[2], (tempArray.length - 3).toString() + " more..."];
        scanCoverageData.scanParameters[issue.title] = tempArray;
    });
}

function allSubpages(issue){
    let allSubpages = [];

        if (issue.highConfidence.length > 0){
            issue.highConfidence.forEach((url) => {
                allSubpages.push(url);
            })
        }
        if (issue.mediumConfidence.length > 0){
        issue.mediumConfidence.forEach((url) => {
            allSubpages.push(url);
        })
        }
        if (issue.lowConfidence.length > 0){
        issue.lowConfidence.forEach((url) => {
            allSubpages.push(url);
        })
        }
    return allSubpages;
}

function createIssueHTML(issue) {
    // creating the unique ids by setting them to their issue ids
    let highConfidenceHTML = createConfidenceHTML(issue.highConfidence);
    let mediumConfidenceHTML = createConfidenceHTML(issue.mediumConfidence);
    let lowConfidenceHTML = createConfidenceHTML(issue.lowConfidence);
    let highConfidenceid = "high-confidence" + issue.id.toString();
    let data_toggle_high = highConfidenceid;
    let mediumConfidenceid = "medium-confidence" + issue.id.toString();
    let data_toggle_medium = mediumConfidenceid;
    let lowConfidenceid = "low-confidence" + issue.id.toString();
    let data_toggle_low = lowConfidenceid;

    return `
      <section class="white-box">
        <div>
          <h3><span class="issue-circle" style="background-color: ${getRiskColor(
        issue.riskLevel
    )};"></span> ${issue.title}</h3>
          <h4>URL</h4>
          <p><a href="${issue.url}" target="_blank">${issue.url}</a></p>
          <h4>Risk Description</h4>
          <p>${issue.description}</p>
          <h4>Actionable Steps</h4>
          <p>${issue.actionableSteps}</p>
          <h4 class="expandable-header" data-toggle=${data_toggle_high}>High Confidence (${issue.highConfidence.length}) ...</h4>
          <p><p>
          <div class="confidence-container" id=${highConfidenceid}>${highConfidenceHTML}</div>
          <h4 class="expandable-header" data-toggle=${data_toggle_medium}>Medium Confidence (${issue.mediumConfidence.length}) ...</h4>
          <p><p>
          <div class="confidence-container" id=${mediumConfidenceid}>${mediumConfidenceHTML}</div>
          <h4 class="expandable-header" data-toggle=${data_toggle_low}>Low Confidence (${issue.lowConfidence.length}) ...</h4>
          <p><p>
          <div class="confidence-container" id=${lowConfidenceid}>${lowConfidenceHTML}</div>
        </div>
      </section>
    `;
}

function createConfidenceHTML(confidenceArray) {
    if (confidenceArray.length === 0) {
        return '';
    }

    return confidenceArray.map((item, index) => `<div>${index + 1}. ${item}</div>`).join('');
}

function getRiskColor(riskLevel) {
    let unclassified = "N/A";
    const riskColors = {
        Low: "#f1c40f", // yellow
        Moderate: "#e67e22", // orange
        High: "#e74c3c", // red
        Informational: "#0074CC",
        [unclassified]: "#AAAAAA",

    };
    return riskColors[riskLevel];
}

function updateSummary() {
    // Calculate totals of each risk
    const totalIssues = issues.length;
    const lowRiskCount = issues.filter(
        (issue) => issue.riskLevel === "Low"
    ).length;
    const moderateRiskCount = issues.filter(
        (issue) => issue.riskLevel === "Moderate"
    ).length;
    const highRiskCount = issues.filter(
        (issue) => issue.riskLevel === "High"
    ).length;
    const informationalRiskCount = issues.filter(
        (issue) => issue.riskLevel === "Informational"
    ).length;
    const unclassifiedRiskCount = issues.filter(
        (issue) => issue.riskLevel === "N/A"
    ).length;

    document.querySelector(
        ".black-box-summary p"
    ).textContent = `We found ${totalIssues} security vulnerabilities`;
    document.querySelector(
        ".black-box-summary .yellow"
    ).textContent = `${lowRiskCount} Low Risk Issues`;
    document.querySelector(
        ".black-box-summary .orange"
    ).textContent = `${moderateRiskCount} Moderate Risk Issues`;
    document.querySelector(
        ".black-box-summary .red"
    ).textContent = `${highRiskCount} High Risk Issues`;
    document.querySelector(
        ".black-box-summary .blue"
    ).textContent = `${informationalRiskCount} Informational Risk Issues`;
    document.querySelector(
        ".black-box-summary .off-white"
    ).textContent = `${unclassifiedRiskCount} Unclassified Risk Issues`;
}

// allows for when all issues are shown, informational issues are shown first.
function sortIssues (filteredIssues) {
    let informationalIssues = [];
    let otherIssues = [];
    issues.forEach((issue) => {
        if (issue.riskLevel == "Informational") informationalIssues.push(issue);
        else otherIssues.push(issue);
    });

    issues = informationalIssues;

    otherIssues.forEach((other) =>{
        issues.push(other);
    })
}
function renderIssues(filteredIssues, filter) {
    const issuesContainer = document.getElementById("issues-list");

    issuesContainer.innerHTML = filteredIssues
        .map((issue) => createIssueHTML(issue))
        .join("");

// adding event listeners whenever the issues are rendered
    document.querySelectorAll('.expandable-header').forEach(header => {
        header.addEventListener('click', function () {
            var targetId = this.dataset.toggle;
            var targetContainer = document.getElementById(targetId);
            if (targetContainer) {
                if (targetContainer.style.display === 'none' || targetContainer.style.display === '') {
                    targetContainer.style.display = 'flex'; // open position of subpage links
                } else {
                    targetContainer.style.display = 'none'; // closed position of subpage links
                }
            }
        });
    });
}

function filterIssues(riskLevel) {
    const filteredIssues = issues.filter(
        (issue) => riskLevel === "All" || issue.riskLevel === riskLevel
    );
    filteredIssues.sort((a, b) => a.dateScanned - b.dateScanned);
    renderIssues(filteredIssues, riskLevel);
    updateSummary();
    updateDropdownSelection(riskLevel);
}

function updateDropdownSelection(selectedRiskLevel) {
    const dropdown = document.getElementById("risk-level-dropdown");
    const totalIssues = issues.length;
    const lowRiskCount = issues.filter(
        (issue) => issue.riskLevel === "Low"
    ).length;
    const moderateRiskCount = issues.filter(
        (issue) => issue.riskLevel === "Moderate"
    ).length;
    const highRiskCount = issues.filter(
        (issue) => issue.riskLevel === "High"
    ).length;
    const informationalRiskCount = issues.filter(
        (issue) => issue.riskLevel === "Informational"
    ).length;
    const unclassifiedRiskCount = issues.filter(
        (issue) => issue.riskLevel === "N/A"
    ).length;

    // Update dropdown options
    dropdown.querySelector(
        'option[value="All"]'
    ).textContent = `All (${totalIssues})`;
    dropdown.querySelector(
        'option[value="Low"]'
    ).textContent = `Low Risk (${lowRiskCount})`;
    dropdown.querySelector(
        'option[value="Moderate"]'
    ).textContent = `Moderate Risk (${moderateRiskCount})`;
    dropdown.querySelector(
        'option[value="High"]'
    ).textContent = `High Risk (${highRiskCount})`;
    dropdown.querySelector(
        'option[value="Informational"]'
    ).textContent = `Informational Risk (${informationalRiskCount})`;
    dropdown.querySelector(
        'option[value="N/A"]'
    ).textContent = `Unclassified Risk (${unclassifiedRiskCount})`;

    // Set the selected value
    dropdown.value = selectedRiskLevel;
}

function createTestsPerformedHTML(tests) {
    // Use map to create an HTML string for each test, then join them into one string
    return tests.map((test) => `<p>✓ ${test}</p>`).join("");
}

function renderScanCoverage() {
    const testsPerformedContainer = document.getElementById("test-performed");
    const scanParametersContainer = document.getElementById("scan-parameter");

    // Create HTML for tests performed
    const testsPerformedHTML = scanCoverageData.testsPerformed
        .map((test) => `<p>✓ ${test}</p>`)
        .join("");
    testsPerformedContainer.innerHTML = testsPerformedHTML;

    // Create HTML for scan parameters
    let scanParametersHTML = '';

    Object.entries(scanCoverageData.scanParameters)
        .forEach(([key, value]) => {
            const formattedValue = Array.isArray(value) ? value.map(item => `<p>${item}</p>`).join('') : `<p>${value}</p>`;
            scanParametersHTML += `<p>${key}:</p>${formattedValue}<br>`;
        });

    scanParametersContainer.innerHTML = scanParametersHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
    issues = await fetchInfo();
    sortIssues(); // making the informational display at the top
    populateScanCoverageData();
    const dropdown = document.getElementById("risk-level-dropdown");
    dropdown.addEventListener("change", function () {
        console.log("the value of this value is " +this.value);
        filterIssues(this.value);
    });
    filterIssues("All"); // Render issues when the page is first loaded
    updateSummary(); // Update the summary counts on page load
    renderScanCoverage();

    document.getElementById('exportPrint').addEventListener('click', function () {
        toggleAll();
        window.print();
        untoggleAll();
    });

});

function toggleAll() {
    issues.forEach(issue => {
        var highContainer = document.getElementById("high-confidence" + issue.id.toString());
        var mediumContainer = document.getElementById("medium-confidence" + issue.id.toString());
        var lowContainer = document.getElementById("low-confidence" + issue.id.toString());

        // sets all the subpage link containers to postion open
        toggleVisibility(highContainer);
        toggleVisibility(mediumContainer);
        toggleVisibility(lowContainer);
    })
}

function untoggleAll() {
    issues.forEach(issue => {
        var highContainer = document.getElementById("high-confidence" + issue.id.toString());
        var mediumContainer = document.getElementById("medium-confidence" + issue.id.toString());
        var lowContainer = document.getElementById("low-confidence" + issue.id.toString());

        // sets all the subpage link containers to postion open
        untoggleVisibility(highContainer);
        untoggleVisibility(mediumContainer);
        untoggleVisibility(lowContainer);
    })
}

function toggleVisibility(container) {
    // if statement makes sure the container is not already open
    if (container && container.style.display !== 'flex') {
        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    }
}

function untoggleVisibility(container) {
    // if statement makes sure the container is not already open
    if (container && container.style.display == 'flex') {
        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    }
}



