//our username
var name;
var connectedUser;

//connecting to our signaling server
var conn = new WebSocket('ws://flex-aa.herokuapp.com');
console.log('hello');

conn.onopen = function () {
   console.log("Connected to the signaling server");
};

//when we got a message from a signaling server
conn.onmessage = function (msg) {
   console.log("Got message", msg.data);

   var data = JSON.parse(msg.data);

    if ("offer" in data){
      if (window.sentOffer) return;
       handleOffer(data.offer, data.name);
    }
    else if ("answer" in data){
       handleAnswer(data.answer);
    }
    //when a remote peer sends an ice candidate to us
    else if("candidate" in data){
        if (window.sentOffer) return;
       handleCandidate(data.candidate);
     }
    else if ("leave" in data){
       handleLeave();
    }

};

conn.onerror = function (err) {
   console.log("Got error", err);
};

//alias for sending JSON encoded messages
function send(message) {

   conn.send(JSON.stringify(message));
};

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
var loginPage = document.querySelector('#loginPage');
var usernameInput = document.querySelector('#usernameInput');
var loginBtn = document.querySelector('#loginBtn');
var yourConn;
var stream;
var callPage = document.querySelector('#callPage');
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn');

var hangUpBtn = document.querySelector('#hangUpBtn');
loginPage.style.display = "none";

navigator.getUserMedia({ video: true, audio: true }, function (myStream) {
         stream = myStream;

         //displaying local video stream on the page
         localVideo.src = window.URL.createObjectURL(stream);

         //using Google public stun server
         var configuration = {
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
         };

         yourConn = new webkitRTCPeerConnection(configuration);

         // setup stream listening
         yourConn.addStream(stream);

         //when a remote user adds stream to the peer connection, we display it
         yourConn.onaddstream = function (e) {
            remoteVideo.src = window.URL.createObjectURL(e.stream);
         };

         // Setup ice handling
         yourConn.onicecandidate = function (event) {

            if (event.candidate) {
               send({
                  candidate: event.candidate
               });
            }

         };

      }, function (error) {
         console.log(error);
  });

  //initiating a call
  callBtn.addEventListener("click", function () {
     if (true) {
       window.sentOffer = true;
        // create an offer
        yourConn.createOffer(function (offer) {
           send({
              type: "offer",
              offer: offer
           });

           yourConn.setLocalDescription(offer);

        }, function (error) {
           alert("Error when creating an offer");
        });
     }
  });

  //when somebody sends us an offer
  function handleOffer(offer) {
    console.log(offer);
     yourConn.setRemoteDescription(new RTCSessionDescription(offer));
     //create an answer to an offer
     yourConn.createAnswer(function (answer) {
        yourConn.setLocalDescription(answer);

        send({
           type: "answer",
           answer: answer
        });

     }, function (error) {
        alert("Error when creating an answer");
     });
  };

  //when we got an answer from a remote user
  function handleAnswer(answer) {
     yourConn.setRemoteDescription(new RTCSessionDescription(answer));
  };

  //when we got an ice candidate from a remote user
  function handleCandidate(candidate) {
     yourConn.addIceCandidate(new RTCIceCandidate(candidate));
  };

  //hang up
  hangUpBtn.addEventListener("click", function () {

     send({
        type: "leave"
     });

     handleLeave();
  });

  function handleLeave() {
     connectedUser = null;
     remoteVideo.src = null;

     yourConn.close();
     yourConn.onicecandidate = null;
     yourConn.onaddstream = null;
  };
