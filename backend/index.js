const crypto = require('crypto');

function generateSHA256Hash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

const express = require('express');
const app = express();
const port = 3022;

const bodyParser = require('body-parser');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.json());

let userCredentials = {
    [generateSHA256Hash("admin")]: {
        "password": generateSHA256Hash("123123123"),
        "loginToken": ""
    }
}

app.get('/', (req, res) => {
    res.send("Welcome to the Backend!");
});

app.get('/getusers', (req, res) => {
    res.send(userCredentials);
});

app.put('/attempt-authentication', (req, res) => {
    const requestData = req.body;

    let attemptedUsername = requestData["username"];
    let attemptedLoginToken = requestData["loginToken"];

    try{
        let userData = userCredentials[generateSHA256Hash(attemptedUsername)]
        console.log(userData["loginToken"])
        console.log(attemptedLoginToken)
        if (userData["loginToken"] == attemptedLoginToken){
            console.log("ATTEMPTING AUTHENTICATION: SUCCESS")
            res.json({"status": 'success'});
        }else{
            console.log("ATTEMPTING AUTHENTICATION: Incorrect Credentials")
            res.json({"status": 'fail'});
        }

    }catch{
        console.log("ATTEMPTING AUTHENTICATION: User Not Found")
        res.json({"status": 'fail'});
    }
});

app.put('/attempt-login', (req, res) => {
    const requestData = req.body;

    let attemptedUsername = requestData["username"];
    let attemptedPassword = requestData["password"];

    try{
        let userData = userCredentials[generateSHA256Hash(attemptedUsername)]
        if (userData["password"] == generateSHA256Hash(attemptedPassword)){
            let currentTimestamp = (Date.now()).toString()
            let randomValue = (Math.random()).toString();
            let newLoginToken = generateSHA256Hash(attemptedUsername + "-" + currentTimestamp + "-" + randomValue)
            userData["loginToken"] = newLoginToken;
            console.log("ATTEMPTING LOGIN: SUCCESS")
            res.json({
                "status": 'success',
                "loginToken": newLoginToken
            });
        }else{
            console.log("ATTEMPTING LOGIN: Incorrect Credentials")
            res.json({"status": 'fail'});
        }

    }catch{
        console.log("ATTEMPTING LOGIN: User Not Found")
        res.json({"status": 'fail'});
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});