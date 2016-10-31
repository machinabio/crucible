"use strict";

import '/imports/peripherals.js';

var fs = require("fs");
var csvWriter = require("csv-write-stream");

var FREQ = process.env.LOG_FREQUENCY || 1000;

var writer = csvWriter({
  sendHeaders: true,
});

writer.pipe(fs.createWriteStream('reads.csv'));

process.on('exit', function () {
  writer.end();
});

var logReads = function () {
  var thermolator = Peripherals.findOne({_id: 'thermolator'});
  var chamber     = Peripherals.findOne({_id: 'chamber'});
  var led         = Peripherals.findOne({_id: 'led'});
  var timestamp   = new Date().toISOString();

  var readings = {
    ts: timestamp,
    pressure: chamber.pressure,
    pressureSetPoint: chamber.setpoint,
    boardTemp: chamber.boardTemp,
    chamberTemp: chamber.chamberTemp,
    thermTemp: thermolator.temperature,
    thermSetPoint: thermolator.setpoint,
    LEDBrightness: led.brightness,
    LEDSetPoint: led.setpoint,
    LEDDutyCycle: led.dutyCycle,
  };

  writer.write(readings);
};

Meteor.setInterval(logReads, FREQ);

export default logReads;
