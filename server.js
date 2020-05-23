var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors')
var apiRouter = require('./apiRouter').router;
var serveur = express();
const path = require('path');
const fs = require('fs');
const axios = require('axios');



serveur.use(cors())
serveur.use(bodyParser.urlencoded({extended: true}));
serveur.use(bodyParser.json());

serveur.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>SERVER STARTED</h1>');
});

const VERIFY_TOKEN = 'abc123';


serveur.use('/api/', apiRouter);



// Endpoint for verifying webhook subscripton
serveur.get('/webhook', (req, res) => {
    if (!req.query) {
      res.send({success: false, reason: 'Empty request params'});
      return;
    }
    // Extract a verify token we set in the webhook subscription and a challenge to echo back.
    const verifyToken = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    if (!verifyToken || !challenge) {
      res.send({
        success: false,
        reason: 'Missing hub.verify_token and hub.challenge params',
      });
      return;
    }
  
    if (verifyToken !== VERIFY_TOKEN) {
      res.send({success: false, reason: 'Verify token does not match'});
      return;
    }
    // We echo the received challenge back to Facebook to finish the verification process.
    res.send(challenge);
  });
  
  /////////////////////////////////////////////////////////////////////////
  //                  Part 2: Retrieving realtime leads                  //
  /////////////////////////////////////////////////////////////////////////
  
  // Graph API endpoint
  const GRAPH_API_VERSION = 'v4.0';
  const GRAPH_API_ENDPOINT = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
  // Your system user access token file path.
  // Note: Your system user needs to be an admin of the subscribed page.
  const ACCESS_TOKEN_PATH = path.join(
    __dirname,
    '..',
    'token',
    'access_token.txt'
  );
  
  // Read access token for calling graph API.
  if (!fs.existsSync(ACCESS_TOKEN_PATH)) {
    console.log(`The file ${ACCESS_TOKEN_PATH} does not exist.`);
    process.exit(1);
  }
  const accessToken = fs.readFileSync(ACCESS_TOKEN_PATH, 'utf-8');
  // Facebook will post realtime leads to this endpoint if we've already subscribed to the webhook in part 1.
  serveur.post('/webhook', (req, res) => {
    const entry = req.body.entry;
  
    entry.forEach(page => {
      page.changes.forEach(change => {
        // We get page, form, and lead IDs from the change here.
        // We need the lead gen ID to get the lead data.
        // The form ID and page ID are optional. You may want to record them into your CRM system.
        const {page_id, form_id, leadgen_id} = change.value;
        console.log(
          `My page ID ${page_id}, My Form ID ${form_id}, Lead gen ID ${leadgen_id}`
        );
  
        // Call graph API to request lead info with the lead ID and access token.
        const leadgenURI = `${GRAPH_API_ENDPOINT}/${leadgen_id}?access_token=EAAFnre1JI2wBAGg2IHYoz8ZAykSZBn88ZCVsBMNnB6V7WvL5Xp7qBJBTTI0o24WCqPTm4rDF4SyxwUQn2LN6bZCaAw300rKVaXJjUKEjwZA8rOekAV5tO1XxaWupJhKZCVQ8TaofKASDEyhE3kCaW6RJHNdFjQ4HjHtNJZCIu3TmtwZCDDfolJvlIJ0HkSaTX5gZD`;
  
        axios.get(leadgenURI).then(response => {
            console.log(JSON.stringify(response.data));
        });
          
      });
    });
    // Send HTTP 200 OK status to indicate we've received the update.
    res.sendStatus(200);
  });


serveur.listen(3000, function () {
    console.log("server run")
});