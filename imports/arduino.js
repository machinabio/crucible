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

var initSerialPort = function () {
    if (process.env.NODE_ENV === 'development') {
        console.warn('Using virtual-serialport for arduino');
        //WARN virtual-serialport might not be compatible with v2.x API

        return require('virtual-serialport')
    }

    return require('serialport');
};

if (Meteor.settings.arduino) {
    var SerialPort = initSerialPort();

    //WARN v2.x  and v4.x have different invokations for constructing serialports
    var port = new SerialPort.SerialPort(Meteor.settings.arduino.port, {
        baudrate: Meteor.settings.arduino.baudrate,
        parser: SerialPort.parsers.readline('\r\n')
    });

    port.on('open', function onOpen() {
        if (Meteor.settings.logging) console.log('Arduino serial port open: '+Meteor.settings.arduino.port);
    });
    
    port.on('data', Meteor.bindEnvironment(function onData(data) {
        let parsedData = JSON.parse(data);
        Peripherals.update('chamber', {
            $set: {
                chamberTemp: parsedData.TempChamber,
                boardTemp: parsedData.TempBoard,
                pressure: parsedData.Pressure
            }
        });
        Peripherals.update('led', {
            $set: {
                brightness: parsedData.LUX
            }
        });
        if (Meteor.settings.logging) console.log('Received data from arduino ', parsedData);
    }));

    var block = false;
    Meteor.setInterval(function updateArduino() {
        if (block) return
        block = true;
        let chamber = Peripherals.findOne('chamber');
        let led = Peripherals.findOne('led')

        // luxPWM : led brightness. 0-255 (PWM setting)
        // vS : Array of valve states. 0-255 (PWM setting)
        // rst : Toggle the watchdog timer on the Arduino
        // todo : controls what the arduino does.
        //  0 = read pressure and Lux
        //  1 = read pressure, update valve PWM value
        //  2 = read pressure, read lux, and update LED PWM value
        //  3 = read pressure, read lux, and update LED and valve PWM values
        let message = {
            luxPWM: led.dutyCycle * 2.55, // normalizes 0-100 to 0-255
            vS: [chamber.v1, chamber.v2, chamber.v3, chamber.v4],
            rst: 1,
            todo: 3
        };
        if (port.isOpen()) {
            port.write(JSON.stringify(message), () => { block = false; });
        }
        if (Meteor.settings.logging) console.log('Sending data to arduino ', message);
    }, 1000);
}
