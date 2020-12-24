var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");
var app = express();
const ethers = require('ethers')

let chats = {} //the current "target" chat (what should be displayed to the user)
let indexes = {} //where any given user is within the dialog

app.use(cors())

/*
const allDialog = [
  {id: 1, punk: 1234, text: "Welcome to [eth.dev](/)!!!"},
  {id: 2, text: "You need to be a good dev..."},
  {id: 3, buttons: [
    {
      text: "No, I'm not a developer",
      link: "https://eth.build"
    },
    {
      text: "Yes, I can code!",
      props:{ primary: true },
      goto: 4
    }
  ]},
  {id: 4, text: "okay cool, let's continue..."},
  {id: 5, text: "This is testing the basic flow of dialog."},
  {id: 6, text: "What would you like to try next?"},
  {id: 7, buttons: [
    {
      text: "No, I'm not a developer",
      link: "https://eth.build"
    },
    {
      text: "Yes, I can code!",
      props:{ primary: true },
      goto: 4
    }
  ]},
]*/

const allDialog = [{"type":"Text","id":"b8992fc0-445f-492d-b0f5-9fe8211f9f9f","actor":"punk5950.png","name":"hello, welcome to [eth.dev](https://eth.dev)!!! ","next":"6fc0a558-294c-4700-b281-23bb8b770020"},{"type":"Text","id":"b96ab52c-af5c-4a39-ab7b-2099267d2ccf","actor":"punk5950.png","name":"you need to be a good coder","choices":["c74004bb-4469-42d1-9e7d-2cb027dc81aa","960ae9c4-b42e-45ff-b392-f1bf7a56b1c3","04dc29fd-a0a0-4dda-845d-6b2b97d962e9"]},{"type":"Choice","id":"c74004bb-4469-42d1-9e7d-2cb027dc81aa","title":"","name":"I'm leet","next":"9a8c650e-582c-44c4-82ce-2b5b78df0f39"},{"type":"Choice","id":"960ae9c4-b42e-45ff-b392-f1bf7a56b1c3","title":"","name":"I'm no good","next":"d3719e33-4546-4555-8cbc-34a1b6d72648"},{"type":"Node","id":"42065e6e-670e-4cc5-8dcf-7db0e5e9ae69","actor":"link","name":"https://eth.build ","next":null},{"type":"Text","id":"9a8c650e-582c-44c4-82ce-2b5b78df0f39","actor":"punk5950.png","name":"awesome, let's get started ","next":"284ca834-4dc4-4917-acb0-c74ef11a0969"},{"type":"Text","id":"284ca834-4dc4-4917-acb0-c74ef11a0969","actor":"punk5950.png","name":"what do you think?","choices":["ee1bfe57-3319-44f8-a1f5-4214d1041782"]},{"type":"Choice","id":"ee1bfe57-3319-44f8-a1f5-4214d1041782","title":"","name":"wait what again?","next":"b96ab52c-af5c-4a39-ab7b-2099267d2ccf"},{"type":"Choice","id":"04dc29fd-a0a0-4dda-845d-6b2b97d962e9","title":"","name":"what?","next":"b8992fc0-445f-492d-b0f5-9fe8211f9f9f"},{"type":"Text","id":"d3719e33-4546-4555-8cbc-34a1b6d72648","actor":"punk5950.png","name":"okay, what to learn?","choices":["e8d57968-204c-4334-9279-3d44ed30d3e2","b02ad027-a59c-4056-a0b9-fe0378ba84be"]},{"type":"Choice","id":"e8d57968-204c-4334-9279-3d44ed30d3e2","title":"","name":"ethbuild","next":"42065e6e-670e-4cc5-8dcf-7db0e5e9ae69"},{"type":"Choice","id":"b02ad027-a59c-4056-a0b9-fe0378ba84be","title":"","name":"nah I can do it","next":"9a8c650e-582c-44c4-82ce-2b5b78df0f39"},{"type":"Text","id":"6fc0a558-294c-4700-b281-23bb8b770020","actor":"punk5950.png","name":"more info\n\nwith a [link](https://austingriffith.com)\n\nand maybe\n\n```bash\nchmod +x *.sh\n```","next":"b96ab52c-af5c-4a39-ab7b-2099267d2ccf"}]

  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const getDialog = (id)=>{
  for(let i=0;i<allDialog.length;i++){
    if(allDialog[i].id==id){
      return allDialog[i]
    }
  }
}

app.get("/", function(req, res) {
  //we'll use this end point to serve the onboarding chat:
  //we wont have a user id yet so we'll do ip+agent as a hash
  const tempUserId = ethers.utils.keccak256([req.connection.remoteAddress,req.headers['user-agent']])
  console.log("/ (noob checkin)",tempUserId,req.connection.remoteAddress,req.headers['user-agent'])

  if(!indexes[tempUserId]){
    indexes[tempUserId] = allDialog[0].id
  }

  let allCurrentDialog = []
  let done = false
  let index = indexes[tempUserId]
  while(!done){
    let currentDialog = getDialog(index)
    //console.log("["+currentDialog.id+"]")
    allCurrentDialog.push(currentDialog)

    if(currentDialog.name){
      currentDialog.text = currentDialog.name
      delete currentDialog.name // wtf who named this "name" (ajboni/Talkit did)
    }

    if(currentDialog.next){
      //console.log("=>("+currentDialog.next+")")
      index = currentDialog.next
    } else if(currentDialog.choices){
      let responseDialog = {
        id: currentDialog.id+"-choices"
      }

      responseDialog.buttons = []

      for(let c=0;c<currentDialog.choices.length;c++){
        let thisChoice = getDialog(currentDialog.choices[c])
        responseDialog.buttons.push(
          {
            text: thisChoice.name,
            next: thisChoice.next
          }
        )
      }
      allCurrentDialog.push(responseDialog)
      done=true
    }else{
      done=true
    }
  }

  console.log("allCurrentDialog",allCurrentDialog)

  res.status(200).send(JSON.stringify(allCurrentDialog))
});
/*
app.get("/:key", function(req, res) {
    let key = req.params.key
    console.log("/",key)
    res.status(200).send(transactions[key]);
});
*/

app.post('/', function(request, response){
    const tempUserId = ethers.utils.keccak256([request.connection.remoteAddress,request.headers['user-agent']])
    console.log("/ (POST ANSWER) ",tempUserId,request.body)
    if(request.body.next){

      indexes[tempUserId] = request.body.next

      console.log("updated indexes for ",tempUserId,indexes[tempUserId])
    }
      // your JSON
    /*response.send(request.body);    // echo the result back
    const key = request.body.address+"_"+request.body.chainId
    console.log("key:",key)
    if(!transactions[key]){
        transactions[key] = {}
    }
    transactions[key][request.body.hash] = request.body
    console.log("transactions",transactions)*/
});

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
