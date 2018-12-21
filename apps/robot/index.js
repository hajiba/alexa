'use strict';

module.change_code = 1;

var alexa = require("alexa-app");
var gcm = require("node-gcm");
var app = new alexa.app("robot");

const gcmServerKey = process.env.GCM_SERVER_KEY;
const registrationToken = process.env.REGISTRATION_TOKEN;

var sender = new gcm.Sender(gcmServerKey);
var registrationTokens = [registrationToken];

var n = ["forward"];
var e = ["right"];
var s = ["backward"];
var w = ["left"];

// index is a code
var directionsCodes = [n, e, s, w];
var directions = [].concat.apply([], directionsCodes);

function directionToCode(direction) {
  for (var i = 0; i < directionsCodes.length; i++) {
    for (var j = 0; j < directionsCodes[i].length; j++) {
      if (directionsCodes[i][j] == direction) {
        return i;
      }
    }
  }
  return -1;
}

var lightsCode = 9;

app.dictionary = {
  "directions": directions
};

app.launch(function(request, response) {
  response.shouldEndSession(false);
  console.log("Session started");
  response.say("Welcome to robot control application!");
});

app.sessionEnded(function(request, response) {
  console.log("Session ended");
});

app.intent("RobotDialogIntent", {
    "utterances": [
      "move {directions}",
    ]
  },
  function(request, response) {
    response.shouldEndSession(false);
    var directionCode = 3;
    var canonicalDirection = 2;
    var message = new gcm.Message({
        data: { code: directionCode }
    });
    sender.send(message, { registrationTokens: registrationTokens }, function (err, data) {
        if (err) {
          console.error(err);
          response.say("Sorry, there was an unexpected error. Could not send message to robot.");
        } else {
          console.log(data);
          if (request.hasSession()) {
            var session = request.getSession();
            var counter = session.get(canonicalDirection);
            if (counter == null) {
              counter = 1;
            } else {
              counter = parseInt(counter) + 1;
            }
            session.set(canonicalDirection, counter.toString());
          }
          response.say("Moving the robot to " + canonicalDirection);
        }
        response.send();
    });
    return false;
  }
);


app.intent("RobotStopIntent", {
    "utterances": [
      "{stop}"
    ]
  },
  function(request, response) {
    response.say("It was a real pleasure talking to you. Have a good day!");
  }
);

module.exports = app;
