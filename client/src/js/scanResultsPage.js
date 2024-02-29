// JavaScript used for the Result Page's functionality.
// Sample data
const issues = [{
    id: 1,
    title: "Insecure Cookies",
    url: "http://example.com/insecure-cookies",
    riskLevel: "low",
    description:
        "The application cookies are not set with the secure attribute.",
    actionableSteps:
        "Ensure all cookies are set with the secure attribute in production.",
    dateScanned: new Date(),
    highConfidence:
        ["http://example.com/insecure-cookies-blahblhablhablhejajjjejaudia", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies-blahblhablhablhejajjjejaudia", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies"],
    mediumConfidence:
        ["http://example.com/insecure-cookies", "http://exampleeeeeeeeeeee.com/insecure-cookies"],
    lowConfidence:
        [],
}, {
    id: 2,
    title: "Insecure Cookies",
    url: "http://example.com/insecure-cookies",
    riskLevel: "low",
    description:
        "The application cookies are not set with the secure attribute.",
    actionableSteps:
        "Ensure all cookies are set with the secure attribute in production.",
    dateScanned: new Date(),
    highConfidence:
        ["http://example.com/insecure-cookies-blahblhablhablhejajjjejaudia", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies"],
    mediumConfidence:
        ["http://example.com/insecure-cookies", "http://exampleeeeeeeeeeee.com/insecure-cookies"],
    lowConfidence:
        ["afbwiufaiubf", "awduoawbdwau", "wubdaubwbduaiobduawdb", "dfwaobdouwabo"],
}, {
    id: 3,
    title: "Insecure Cookies",
    url: "http://example.com/insecure-cookies",
    riskLevel: "low",
    description:
        "The application cookies are not set with the secure attribute.",
    actionableSteps:
        "Ensure all cookies are set with the secure attribute in production.",
    dateScanned: new Date(),
    highConfidence:
        ["http://example.com/insecure-cookies-blahblhablhablhejajjjejaudia", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies", "http://example.com/insecure-cookies"],
    mediumConfidence:
        ["http://example.com/insecure-cookies", "http://exampleeeeeeeeeeee.com/insecure-cookies"],
    lowConfidence:
        ["afbwiufaiubf", "awduoawbdwau", "wubdaubwbduaiobduawdb", "dfwaobdouwabo"],
}];


fetch('http://localhost:8800/returnScanIds',
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
                issues.push({
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
                })

            } else
                issues.push({
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
                })
        })
    })
    .catch(error => console.error('Error fetching data:', error));

fetch('http://localhost:8800/returnInfo',
    {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        for (let key in data) {
            issues.forEach((issue) => {
                if (key == issue.id) {
                    let temp = data[key];
                    issue.highConfidence = temp.highConfidence;
                    issue.lowConfidence = temp.lowConfidence;
                    issue.mediumConfidence = temp.mediumConfidence;
                }
            });
        }
    })
const scanCoverageData = {
    testsPerformed: [],

    scanParameters: {},
};

issues.forEach((issue) => {
    scanCoverageData.testsPerformed.push('Testing for ' + issue.title);
    scanCoverageData.scanParameters[issue.title] = issue.url;
});



function createIssueHTML(issue) {
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
    const riskColors = {
        low: "#f1c40f", // yellow
        moderate: "#e67e22", // orange
        high: "#e74c3c", // red
    };
    return riskColors[riskLevel];
}

function updateSummary() {
    // Calculate totals of each risk
    const totalIssues = issues.length;
    const lowRiskCount = issues.filter(
        (issue) => issue.riskLevel === "low"
    ).length;
    const moderateRiskCount = issues.filter(
        (issue) => issue.riskLevel === "moderate"
    ).length;
    const highRiskCount = issues.filter(
        (issue) => issue.riskLevel === "high"
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
}

function renderIssues(filteredIssues) {
    const issuesContainer = document.getElementById("issues-list");
    issuesContainer.innerHTML = filteredIssues
        .map((issue) => createIssueHTML(issue))
        .join("");
}

function filterIssues(riskLevel) {
    const filteredIssues = issues.filter(
        (issue) => riskLevel === "all" || issue.riskLevel === riskLevel
    );
    filteredIssues.sort((a, b) => a.dateScanned - b.dateScanned);
    renderIssues(filteredIssues);
    updateSummary();
    updateDropdownSelection(riskLevel, filteredIssues.length);
}

function updateDropdownSelection(selectedRiskLevel) {
    const dropdown = document.getElementById("risk-level-dropdown");
    const totalIssues = issues.length;
    const lowRiskCount = issues.filter(
        (issue) => issue.riskLevel === "low"
    ).length;
    const moderateRiskCount = issues.filter(
        (issue) => issue.riskLevel === "moderate"
    ).length;
    const highRiskCount = issues.filter(
        (issue) => issue.riskLevel === "high"
    ).length;

    // Update dropdown options
    dropdown.querySelector(
        'option[value="all"]'
    ).textContent = `All (${totalIssues})`;
    dropdown.querySelector(
        'option[value="low"]'
    ).textContent = `Low Risk (${lowRiskCount})`;
    dropdown.querySelector(
        'option[value="moderate"]'
    ).textContent = `Moderate Risk (${moderateRiskCount})`;
    dropdown.querySelector(
        'option[value="high"]'
    ).textContent = `High Risk (${highRiskCount})`;

    // Set the selected value
    dropdown.value = selectedRiskLevel;
}

function createTestsPerformedHTML(tests) {
    // Use map to create an HTML string for each test, then join them into one string
    return tests.map((test) => `<p>✓ ${test}</p>`).join("");
}

function createScanParametersHTML(parameters) {
    // Use Object.entries to create an HTML string for each key-value pair in parameters
    return Object.entries(parameters)
        .map(([key, value]) => `<h5>${key}</h5><p>${value}</p>`)
        .join("");
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
    const scanParametersHTML = Object.entries(scanCoverageData.scanParameters)
        .map(([key, value]) => `<p>${key}: ${value}</p>`)
        .join("");
    scanParametersContainer.innerHTML = scanParametersHTML;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('exportPrint').addEventListener('click', function () {
        toggleAll();
        window.print();
        toggleAll();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("risk-level-dropdown");
    dropdown.addEventListener("change", function () {
        filterIssues(this.value);
    });
    filterIssues("all"); // Render issues when the page is first loaded
    updateSummary(); // Update the summary counts on page load
    renderScanCoverage();
});

document.addEventListener('DOMContentLoaded', function () {
    var expandableHeaders = document.querySelectorAll('.expandable-header');

    expandableHeaders.forEach(function (header) {
        header.addEventListener('click', function () {
            var targetId = this.dataset.toggle;
            var targetContainer = document.getElementById(targetId)

            // Toggle visibility of target container
            if (targetContainer) {
                if (targetContainer.style.display === 'none' || targetContainer.style.display === '') {
                    targetContainer.style.display = 'flex';
                } else {
                    targetContainer.style.display = 'none';
                }
            }
        });
    });
});

function toggleAll() {
    issues.forEach(issue => {
        var highContainer = document.getElementById("high-confidence" + issue.id.toString());
        var mediumContainer = document.getElementById("medium-confidence" + issue.id.toString());
        var lowContainer = document.getElementById("low-confidence" + issue.id.toString());

        toggleVisibility(highContainer);
        toggleVisibility(mediumContainer);
        toggleVisibility(lowContainer);
    })
}

function toggleVisibility(container) {
    if (container && container.style.display!== 'flex') {
        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    }
}



