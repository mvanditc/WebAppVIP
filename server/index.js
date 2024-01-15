// Package Require Statements
const express = require('express') // ExpressJS package
const http = require('http') // HTTP Package
const ZapClient = require('zaproxy'); // ZAP package

// ZapClient Configurations
const zapOptions = {
  apiKey: 'rgbemblh086q76aeog2i1s28f1',
  proxy: {
    host: '127.0.0.1',
    port: 8080,
  },
};

const zaproxy = new ZapClient(zapOptions); // Implement configuration into ZAP Client
const app = express() // Define ExpressJS app
const port = 3000 // Specify port used by NodeJS server to listen for requests

// Sleep function is used to trigger delay events in milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Specifying Route for Passive Scan
app.get('/',async (expressReq, expressRes) => {

  // Parameters used for scanning.
  let scanParams = {
    url: "https://google.com", // Target URL
    maxchildren: null,
    recurse: null,
    contextname: null,
    subtreeonly: null
  }

  try {
    let currentScanID = await zaproxy.spider.scan(scanParams)

    // While loop is responsible for making program wait while scan is being completed.
    // "While the scan status is != 100, print the status in the console."
    while (JSON.stringify(await zaproxy.spider.status(currentScanID)) != '{"status":"100"}'){
      console.log(`Spider progress %: ${JSON.stringify(await zaproxy.spider.status(currentScanID))}`)
      sleep(500) // Wait 500 milliseconds before checking progress again.
    }

    // Options that are used to create an HTTP request to the ZAP backend.
    const viewScanResultsRequestOptions = {
      hostname: '127.0.0.1',
      port: 8080,
      path: `/JSON/spider/view/fullResults/?apikey=${zapOptions.apiKey}&scanId=${currentScanID.scan}`,
      method: 'GET',
    };

    // Variable that will be populated with the HTTP response.
    let currentScanResults = ""

    // Making an HTTP GET request to the ZAP backend.
    const httpReq = http.request(viewScanResultsRequestOptions, (httpRes) => {
      let data = '';

      // A chunk of data has been received.
      httpRes.on('data', (chunk) => {
        data += chunk; // Collect all chunks of data.
      });

      // The whole response has been received
      httpRes.on('end', () => {
        try {
          currentScanResults = JSON.parse(data)

          // Send response through ExpressJS backend (This is what the ExpressJS backend returns on the endpoint call)
          expressRes.json({
            '0': "TEST",
            '1': currentScanID,
            '2': currentScanResults
          })

        } catch (error) {
          console.error('Error parsing JSON:', error.message);
        }
      });
    });

    // Handle errors in the request
    httpReq.on('error', (error) => {
      console.error('Error fetching JSON:', error.message);
    });

    // End the request
    httpReq.end();

  } catch (err) {
    console.error('Error: ', err);
  }
})


// Spin up NodeJS server to listen on specified port number.
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})