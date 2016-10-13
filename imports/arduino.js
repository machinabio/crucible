import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
// Assets is still in the global namespace as of Meteor 1.3.4.2. Change to import in the future...
import '/imports/peripherals.js';

var exec = require('child_process').exec;

exec('python ' + Assets.absoluteFilePath('gpioReset.py'), function(error, stdout, stderr) {
  console.log('......Resetting arduino: Finished');
  console.log('......Resetting arduino: Stdout: ' + stdout);
  console.log('......Resetting arduino: Error: ' + stderr);
});
var port;

if (Meteor.settings.arduino) {
  var SerialPort = require('serialport');
  if (process.env.NODE_ENV == 'development') {
    console.log('Using virtual serialport for arduino');
    SerialPort = require('virtual-serialport');
  }

  port = new SerialPort.SerialPort(Meteor.settings.arduino.port, {
    baudrate: Meteor.settings.arduino.baudrate,
    parser: SerialPort.parsers.readline('\r\n')
  });

  port.on('open', function onOpen() {
    console.log('Port Arduino open');
  });

  port.on('data', Meteor.bindEnvironment(function onData(data) {
    var parsedData = JSON.parse(data);
    if (Meteor.settings.logging) console.log('Received data from arduino ',parsedData);
    Peripherals.update({ _id: 'chamber' }, {
      $set: {
        chamberTemp: parsedData.TempChamber,
        boardTemp: parsedData.TempBoard,
        pressure: parsedData.Pressure
      }
    });
    Peripherals.update({ _id: 'led' }, { $set: { brightness: parsedData.LUX } });
  }));

  var block = false;
  var updateArduino = function updateArduino() {
    if (block) return;
    block = true;
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

    if (port.isOpen()) port.write(JSON.stringify(message), ()=>{block = false;});
    if (Meteor.settings.logging) console.log('Sending data to arduino ',message);
  };

  // Send data to Arduino
  var query = Meteor.setInterval(updateArduino, 1000);
}

export default updateArduino;
