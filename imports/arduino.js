import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
// Assets is still in the global namespace as of Meteor 1.3.4.2. Change to import in the future...
import '/imports/peripherals.js';

var SerialPort = require('serialport');
if (process.env.NODE_ENV == 'development') {
  SerialPort = require('virtual-serialport');
}

var exec = require('child_process').exec;

var resetArduino = function resetArdiuno() {
  console.log('>>>>>> Resetting arduino');
  exec(Assets.absoluteFilePath('gpioReset.py'), function(error, stdout, stderr) {
    console.log('......Finished');
    console.log('......Stdout: ' + stdout);
    console.log('......Error: ' + stderr);
  });
};
Meteor.startup(resetArduino);

if (Meteor.settings.arduino) {
  var port = new SerialPort(Meteor.settings.arduino.port, {
    baudrate: Meteor.settings.arduino.baudrate,
    parser: SerialPort.parsers.readline('\r\n')
  });

  port.on('open', function onOpen() {
    console.log('Port Arduino open');
  });

  port.on('data', Meteor.bindEnvironment(function onData(data) {
    var parsedData = EJSON.parse(data);
    Peripherals.update({ _id: 'chamber' }, {
      $set: {
        chamberTemp: parsedData.TempChamber,
        boardTemp: parsedData.TempBoard,
        pressure: parsedData.Pressure
      }
    });
    Peripherals.update({ _id: 'led' }, { $set: { brightness: parsedData.lux } });
  }));

  var updateArduino = function updateArduino() {
    var chamber = Peripherals.findOne({ _id: 'chamber' });
    var led = Peripherals.findOne({ _id: 'led' })

    var message = {
      luxPWM: led.dutyCycle * 2.55, // normalizes 0-100 to 0-255
      vS: [chamber.v1, chamber.v2, chamber.v3, chamber.v4],
      rst: 1,
      todo: 3
    };
    // the todo field controls what the arduino does.
    //  0 = read pressure and Lux
    //  1 = read pressure, update valve PWM value
    //  2 = read pressure, read lux, and update LED PWM value
    //  3 = read pressure, read lux, and update LED and valve PWM values

    port.write(Buffer.from(EJSON.stringify(message)));
  };

  // Send data to Arduino
  var query = Meteor.setInterval(updateArduino, 1000);
}

export default updateArduino;
