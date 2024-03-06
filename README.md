# Things to do after after you clone:

1) Create the file 'config.json' inside the 'server' folder. In this file, paste this code (make sure to paste your OWN api key from ZAP):

{
  "apiKey": "INSERT_YOUR_API_KEY_HERE"
}

2) Create the file 'data.json' in the folder 'database' and paste this code:

[]

3) Create the file 'webScraperResults1.json' to the 'database' folder and paste the json data. This json data is a file, please ask one of the repo members for the file details that you will have to copy and paste.

# To run the code:

1) Open two terminals.

2) In the first terminal, type the command 'python3 -m http.server'. This should give the message 'Serving HTTP on :: port YOUR_PORT (http://[::]:YOUR_PORT/) ...'

3) In the second terminal, cd into the folder 'server'. Here, run 'npm install'. Then run the command 'npx nodemon temporaryServer.js'. This will start the backend.

# Important Notes (Read this before you start making changes):

1) If you scan more than 3 sites, you will get a message indicating you have reached the limit. To fix this, go to the user.json file, remove all the code from there, and add '[]' to the file. This file needs an empty array to work. 

2) To change the scan time limit, go to the file scanPage.js and search the variable 'globalTerminationTime', then change the value of this.

3) Right-click and select inspect, then go to the tab 'console' to see relevant messages.

