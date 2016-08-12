import { Meteor } from 'meteor/meteor';
mport '/imports/peripherals.js';

var responseThermo;
var oldTime = 0;
var tempBoard, tempChamber, tempTarget, tempFluid, pressure, pressTarget, LUX, luxTarget;
var oldTempTarget = 0;
var LEDBrightness = 0;
var luxPWM = 0;
var incomingTempTarget, incomingPressTarget, incomingLuxTarget;
var v1 = 0;
var v2 = 0;
var v3 = 0;
var v4 = 0;
var arduinoReady = true;
var messageInQue = false;



(function() {
  Meteor.startup(function() {
    var exec = Meteor.npmRequire('child_process').exec;

    console.log('>>>>>> Resetting arduino');
    exec(Assets.absoluteFilePath('gpioReset.py'), function(error, stdout, stderr) {
      console.log('......Finished');
      console.log('......Stdout: ' + stdout);
      console.log('......Error: ' + stderr);
    });
  });

  var messagePub;
  Meteor.publish('messages', function() {
    messagePub = this;
    return this.ready();
  });


  Meteor.methods({
    toServer: function(tempSet, luxSet, pressSet, vent, todo) {
      //messageInQue=true;
      incomingLuxTarget = luxSet;
      incomingPressTarget = pressSet;
      incomingTempTarget = tempSet;
      ventStatus = vent;
    },

    message: function(newDoc) {
      messagePub.added('messages', Random.id(), newDoc);
    },

    removeMessage: function(_id) {
      messagePub.removed('messages', _id);
    }
  });

}).call(this);




};
