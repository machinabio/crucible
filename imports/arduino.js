import { Meteor } from 'meteor/meteor';
import './peripherals.js'

var SerialPort = Meteor.npmRequire('serialport');

var serialPort = new SerialPort.SerialPort('/dev/ttyS0', {
    baudrate: 115200,
    parser: SerialPort.parsers.readline('\r\n')
});

serialPort.on('open', function onOpen() {
    console.log('Port Arduino open');
});

serialPort.on('data', Meteor.bindEnvironment(function onData(data) {
    var parsedData = JSON.parse(data);
    if (parsedData.messageType === 'getAll') {
        tempBoard = parsedData.TempBoard;
        tempChamber = parsedData.TempChamber;
        pressure = parsedData.Pressure;
        lux = parsedData.lux;

        Peripherals.upsert({_id: 'chamber'}, { $set : { chamberTemp: tempChamber}});
        Peripherals.upsert({_id: 'chamber'}, { $set : { boardTemp  : tempBoard}});
        Peripherals.upsert({_id: 'chamber'}, { $set : { pressure   : pressure}});
        Peripherals.upsert({_id: 'led'}, { $set : {brightness: lux}});

        var tempFluid   = Peripherals.findOne({_id: 'thermolator'}).temperature;
        var tempTarget  = Peripherals.findOne({_id: 'thermolator'}).setpoint;
        var pressTarget = Peripherals.findOne({_id: 'chamber'}).setpoint;
        var luxTarget   = Peripherals.findOne({_id: 'led'}).setpoint;

        controlCheck(luxTarget, lux, pressTarget, pressure, tempTarget, tempFluid);
    }
}));

var updateArduino = function updateArduino(luxPWM, v1, v2, v3, v4, todo) {
        luxPWM = luxPWM ? luxPWM : Peripherals.findOne({_id: 'led'}).dutyCycle * 2.55 // normalizes 0-100 to 0-255
        v1     = v1     ? v1     : Peripherals.findOne({_id: 'chamber'}).v1;
        v2     = v2     ? v2     : Peripherals.findOne({_id: 'chamber'}).v2;
        v3     = v3     ? v3     : Peripherals.findOne({_id: 'chamber'}).v3;
        v4     = v4     ? v4     : Peripherals.findOne({_id: 'chamber'}).v4;

        var message = {
        	luxPWM : luxPWWM,
                vS : [ v1, v2, v3, v4 ],
               rst : 1,
              todo : todo
        };

        serialPort.write(new Buffer(JSON.stringfy(message)));
    }
});

var query = Meteor.setInterval(updateArduino, 1000);

export default updateArduino;