import '/imports/peripherals.js';
//import * from '/node_modules/csv-write-stream';

var csvWriter = require("csv-write-stream")
var writer = csvWriter({
  sendHeaders: true,
})


var FREQ = process.env.LOG_FREQUENCY || 1000;

var page = document.getElementById("recorded_readings");

var recording;

var startLog = function() {
  recording = true;
  //create text node of writable stram of data readings
  var content = new Buffer();
  writer.pipe(content);


  var logReads = function () {
    var thermolator = Peripherals.findOne({_id: 'thermolator'});
    var chamber     = Peripherals.findOne({_id: 'chamber'});
    var led         = Peripherals.findOne({_id: 'led'});
    var timestamp   = new Date().toISOString();

    var readings = {
      ts: timestamp,
      pressure: chamber.pressure,
      pressureSetPoint: chamber.setpoint,
      chamberState: chamber.running,
      valve1: chamber.v1,
      valve2: chamber.v2,
      valve3: chamber.v3,
      valve4: chamber.v4,
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
  var node = document.createTextNode(content.toString());
  page.appendChild(node);
  return (content, node);
};

var endLog = function(filename, c_n_tuple) {
  recording = false;
  //SOURCE: https://github.com/mholt/PapaParse/issues/175
  var blob = new Blob(c_n_tuple[0]);
  document.page.removeChild(c_n_tuple[1]);
  var csvURL = window.URL.createObjectURL(blob, {type: "text/plain"});
  var tempLink = document.createElement("a");
  tempLink.href = csvURL;
  tempLink.setAttribute('download', filename);
  tempLink.click();
};

export {startLog, endLog, recording};
