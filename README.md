# Two things needed after you clone:

1) Create the file 'config.json' in the root directory. In this file, paste this code (make sure to paste your OWN api key from ZAP):

{
  "apiKey": "INSERT_YOUR_API_KEY_HERE"
}

2) Create the file 'data.json' in the folder 'database' and paste this code:

[]

# Important Notes (Read this before you start making changes):

1) If you scan more than 3 sites, you will get a message indicating you have reached the limit. To fix this, go to the user.json file, remove all the code from there, and add '[]' to the file. This file needs an empty array to work. 

2) To clear the data list that is showing on the frontend, go to the data.json file that you created before and perform the same as before. Remove the code then add '[]' to the file.

3) To change the scan time limit, go to the file script.js and search the variable 'globalTerminationTime', then change the value of this.

4) Right-click and select inspect, then go to the tab 'console' to see relevant messages.

