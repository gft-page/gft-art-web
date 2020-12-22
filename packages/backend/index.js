var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");
var app = express();
const ethers = require('ethers')

let chats = {}

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  //we'll use this end point to serve the onboarding chat:
  //we wont have a user id yet so we'll do ip+agent as a hash
  const tempUserId = ethers.utils.keccak256([req.connection.remoteAddress,req.headers['user-agent']])
  console.log("/ (noob checkin)",tempUserId,req.connection.remoteAddress,req.headers['user-agent'])

  if(!chats[tempUserId]){
    chats[tempUserId] = [
      {id: 0, punk: 1234, text: "Welcome to [eth.dev](/)!!!"},
      {id: 1, text: "You need to be a good dev..."},
      {id: 2, buttons: [
        { text: "No, I'm not a developer"},
        { text: "Yes, I can code!", props:{ primary: true }}
      ]}
    ]
  }

  res.status(200).send(JSON.stringify(chats[tempUserId]))
});
/*
app.get("/:key", function(req, res) {
    let key = req.params.key
    console.log("/",key)
    res.status(200).send(transactions[key]);
});


app.post('/', function(request, response){
    console.log("POOOOST!!!!",request.body);      // your JSON
    response.send(request.body);    // echo the result back
    const key = request.body.address+"_"+request.body.chainId
    console.log("key:",key)
    if(!transactions[key]){
        transactions[key] = {}
    }
    transactions[key][request.body.hash] = request.body
    console.log("transactions",transactions)
});
*/

if(fs.existsSync('server.key')&&fs.existsSync('server.cert')){
  https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(38124, () => {
    console.log('HTTPS Listening: 48224')
  })
}else{
  var server = app.listen(38124, function () {
      console.log("HTTP Listening on port:", server.address().port);
  });
}
