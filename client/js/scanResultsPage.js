// JavaScript used for the Result Page's functionality.
// Sample data
const issues = [
    // Low Risk Issues
    {
        id: 1,
        title: "Insecure Cookies",
        url: "http://example.com/insecure-cookies",
        riskLevel: "low",
        description:
            "The application cookies are not set with the secure attribute.",
        actionableSteps:
            "Ensure all cookies are set with the secure attribute in production.",
        dateScanned: new Date(),
    },
    {
        id: 2,
        title: "Clickjacking Vulnerability",
        url: "http://example.com/clickjacking",
        riskLevel: "low",
        description: "The application is vulnerable to clickjacking attacks.",
        actionableSteps:
            "Implement X-Frame-Options header to mitigate clickjacking risks.",
        dateScanned: new Date(),
    },
    {
        id: 3,
        title: "Missing HTTP Security Headers",
        url: "http://example.com/missing-headers",
        riskLevel: "low",
        description: "The application is missing important HTTP security headers.",
        actionableSteps:
            "Add headers like Strict-Transport-Security and Content-Security-Policy.",
        dateScanned: new Date(),
    },
    {
        id: 4,
        title: "Mixed Content",
        url: "http://example.com/mixed-content",
        riskLevel: "low",
        description: "The application contains mixed content (HTTP and HTTPS).",
        actionableSteps: "Update all resources to use secure (https) connections.",
        dateScanned: new Date(),
    },
    {
        id: 5,
        title: "Password Policy",
        url: "http://example.com/password-policy",
        riskLevel: "low",
        description: "The application has a weak password policy.",
        actionableSteps:
            "Implement a strong password policy with complexity requirements.",
        dateScanned: new Date(),
    },
    {
        id: 6,
        title: "Missing Security Headers",
        url: "http://example.com/missing-security-headers",
        riskLevel: "low",
        description:
            "The application is missing some recommended security headers.",
        actionableSteps:
            "Include headers like Referrer-Policy and Feature-Policy for added security.",
        dateScanned: new Date(),
    },
    {
        id: 7,
        title: "Content Spoofing",
        url: "http://example.com/content-spoofing",
        riskLevel: "low",
        description: "The application is susceptible to content spoofing.",
        actionableSteps:
            "Implement measures to prevent content spoofing, such as proper input validation.",
        dateScanned: new Date(),
    },
    // Moderate Risk Issues
    {
        id: 8,
        title: "Cross-Site Scripting (XSS)",
        url: "http://example.com/xss-vulnerability",
        riskLevel: "moderate",
        description: "The application's search feature is vulnerable to XSS.",
        actionableSteps:
            "Sanitize all user inputs and implement Content Security Policy (CSP).",
        dateScanned: new Date(),
    },
    {
        id: 9,
        title: "Insecure Direct Object References (IDOR)",
        url: "http://example.com/idor-vulnerability",
        riskLevel: "moderate",
        description: "The application exposes internal objects directly.",
        actionableSteps:
            "Implement proper access controls and validate user permissions.",
        dateScanned: new Date(),
    },
    // High Risk Issues
    {
        id: 10,
        title: "SQL Injection",
        url: "http://example.com/sql-injection",
        riskLevel: "high",
        description: "The application's login form is vulnerable to SQL injection.",
        actionableSteps: "Utilize prepared statements and parameterized queries.",
        dateScanned: new Date(),
    },
    {
        id: 11,
        title: "Server-Side Request Forgery (SSRF)",
        url: "http://example.com/ssrf-vulnerability",
        riskLevel: "high",
        description: "The application is vulnerable to SSRF attacks.",
        actionableSteps:
            "Validate and sanitize user-input URLs, and restrict server-side requests.",
        dateScanned: new Date(),
    },
    {
        id: 12,
        title: "Security Misconfigurations",
        url: "http://example.com/security-misconfigurations",
        riskLevel: "high",
        description:
            "The application has security misconfigurations that could lead to vulnerabilities.",
        actionableSteps:
            "Regularly audit and review server configurations to ensure they follow security best practices.",
        dateScanned: new Date(),
    },
];

const scanCoverageData = {
    testsPerformed: [
        "Testing for example 1",
        "Testing for example 2",
        "Testing for example 3",
        "Testing for example 4",
        "Testing for example 5",
        "Testing for example 6",
        "Testing for example 7",
        "Testing for example 8",
    ],
    scanParameters: {
        target: "http://www.example.com",
    },
};

function createIssueHTML(issue) {
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
        </div>
      </section>
    `;
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

document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("risk-level-dropdown");
    dropdown.addEventListener("change", function () {
        filterIssues(this.value);
    });
    filterIssues("all"); // Render issues when the page is first loaded
    updateSummary(); // Update the summary counts on page load
    renderScanCoverage();
});