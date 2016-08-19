import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
// Assets is still in the global namespace as of Meteor 1.3.4.2. Change to import in the future...
import '/imports/peripherals.js';
import serialport from 'serialport';
import child_process from 'child_process';

var resetArduino = function resetArdiuno() {
  var exec = child_process.exec;
  console.log('>>>>>> Resetting arduino');
  exec(Assets.absoluteFilePath('gpioReset.py'), function(error, stdout, stderr) {
    console.log('......Finished');
    console.log('......Stdout: ' + stdout);
    console.log('......Error: ' + stderr);
  });
};
Meteor.startup(resetArduino);

if (!Meteor.settings.debug) {
  var serialPort = new serialport.SerialPort('/dev/ttyS0', {
    baudrate: 115200,
    parser: SerialPort.parsers.readline('\r\n')
  });

  serialPort.on('open', function onOpen() {
    console.log('Port Arduino open');
  });

  serialPort.on('data', Meteor.bindEnvironment(function onData(data) {
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

    var message = {
      luxPWM: Peripherals.findOne({ _id: 'led' }).dutyCycle * 2.55, // normalizes 0-100 to 0-255
      vS: [chamber.v1, chamber.v2, chamber.v3, chamber.v4],
      rst: 1,
      todo: 3
    };
    // the todo field controls what the arduino does.
    //  0 = read pressure and Lux
    //  1 = read pressure, update valve PWM value
    //  2 = read pressure, read lux, and update LED PWM value
    //  3 = read pressure, read lux, and update LED and valve PWM values

    serialPort.write(Buffer.from(EJSON.stringfy(message)));
  };

  // Send data to Arduino
  var query = Meteor.setInterval(updateArduino, 1000);
}

export default updateArduino;
