import { Meteor } from 'meteor/meteor';
import '/imports/peripherals.js';

var hysteresisReset = true;
var ventStatus = false;

var controlCheck = function controlCheck(luxTarget, luxActual, pressTarget, pressure, tempTarget, tempFluid) {
  var operation = 0;

  // LED CONTROL
  if (Math.abs(luxTarget - luxActual) > 50) {
    luxPWM = luxControl(luxActual, luxTarget, LEDBrightness);
    LEDBrightness = Number(luxPWM / 100 * 255);
    if (isNaN(LEDBrightness)) { LEDBrightness = 0; }
    operation += 2;

    v1 = 0;
    v2 = 0;
    v3 = 0;
    v4 = 0;
  }

  // PRESSURE CONTROL
  if (Math.abs(pressTarget - pressure) > .01) {
    operation += 1;

    //if (pressTarget-pressure<-.3){
    if (pressure / pressTarget < .97) {
      v1 = 0;
      v2 = 0;
      v3 = 0;
      v4 = 255;
      hysteresisReset = true;
    } else {
      var date = new Date();
      var currentTime = date.getSeconds() + (date.getMilliseconds() / 1000);
      var timePassed = currentTime - oldTime;
      var pressureError = PIDPressure(pressure, pressTarget, Number(timePassed), hysteresisReset);
      oldTime = currentTime;

      if (pressureError > 0) {
        v1 = 0;
        v2 = 10 + Math.abs(pressureError);
        v3 = 0;
        v4 = 0;
      }

      if (pressureError < 0) {
        v2 = 0;
        v1 = 0;
        v3 = 10 + Math.abs(pressureError);
        v4 = 0;
      }
      hysteresisReset = false;
    }
  }
  if (ventStatus) {
    v1 = 255;
    v2 = 0;
  }
  Meteor.call('updateArduino', Math.round(luxPWM), v1, v2, v3, v4, operation);

