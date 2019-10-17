/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hey there, I am textBot, here to help you decide if you should send that text!"); //We start with the introduction;
    setTimeout(timedQuestion, 5000, socket, "Who are you thinking of texting?"); // Wait a moment and respond with a question.

  });
 socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
      answer = 'What a coincidence, ' + input + ' just texted me too!'; // output response
      waitTime = 5000;
      question = 'What do you want to text them about?'; // load next question
  } else if (questionNum == 1) {
       answer = 'That\'s quite the topic! Let me see if I can help.'; // output response
       waitTime = 5000;
       question = 'Are you guys on good terms?'; // load next question
  } else if (questionNum == 3 || questionNum == 4) {
      if (input.toLowerCase().includes("no") || input.toLowerCase().includes("not")){
          answer='Gotcha, that\'s probably a good sign!';
          if (questionNum == 3){
            questionNum = 9;
         }
         else{
           questionNum=10;
         }
      } else{
          answer='Haha you totally are, don\'t forget to  drink water!';
          if(questionNum==3){
             questionNum=11;
          }
          else{
            questionNum=12;
          }
      }
      waitTime = 5000;
      question = 'Ok, let me think about this...Let me know when you are ready.'; // load next question
   } else if (questionNum == 2) {
      if (input.toLowerCase()==="no"){
          answer='Oh no, I\'m sorry to hear that!';
          waitTime=5000;
          questionNum++;
          question='Are you drunk right now?';
      } else if (input.toLowerCase()=== "yes"){
          answer='Yay, I\'m glad to hear that!';
          waitTime=5000;
          question='Are you drunk right now?';
      } else{
          answer='Sorry, I\'m confused.  Could you please type "yes" or "no"?';
          questionNum--;
          waitTime=5000;
          question='Are you guys on good terms?';
      }
   } else if (questionNum==13) { 
         socket.emit('changeBG', 'red');
         socket.emit('changeFont', 'white');
         answer='Don\'t text them!! If you try, I\'m hiding your phone for your own good!!';
         waitTime=0;
         question=''
   }
     else if (questionNum==12){
         socket.emit('changeBG', 'pink');
         socket.emit('changeFont', 'white');
         answer='Go ahead and send it, I don\'t see why not!';
         waitTime=0;
         question='';
     }
     else if (questionNum==11){
         socket.emit('changeBG', 'blue');
         socket.emit('changeFont', 'white');
         answer='Honestly, you should probably talk to them in person about that.'
         waitTime=0;
         question=''; 
      }
     else if (questionNum == 10){
         socket.emit('changeBG', 'green');
         socket.emit('changeFont', 'white');
         answer='OMG you should totally send it!! I wish I could see what they\'ll say back! :-O';
         waitTime=0;
         question='';
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//

