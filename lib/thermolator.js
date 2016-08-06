import 'peripherals.js';

// Turn off callbacks during initialization
var intializing = true;

var SerialPort = Meteor.npmRequire('serialport');
var ThermoScientific = true; // if this is false, we assume there's a Julabo thermolator connected

var serialPort = new SerialPort.SerialPort('/dev/ttyUSB0', {
    baudrate: 19200,
    parser: SerialPort.parsers.readline('\r\n')
});

// Initialize the thermolator now
var record = Peripherals.findOne({_id: 'thermolator'});
if (!record) {
    record = {
        _id: 'thermolator',
        temperature: 0,     // in C
        setpoint: 0,        // in C
        running: false      // true = running, false = stopped
    };
    Peripheral.upsert({_id: 'thermolator'}, { $set : record});
};

serialPort.on('open', function() {
    console.log('Port Thermo open');
});

serialPort.on('data', Meteor.bindEnvironment(function(data) {
    console.log('Data from Thermo: ' + data + '\n');
    var reading = Number.parseFloat(data);
    if (reading) Peripherals.upsert({_id: 'thermolator'}, { $set : {temperature: reading}});
}));

var sendToThermo = function(message) {
    serialPort.write(message);
};

var updateThermo = function updateThermo() {
    var tempSet = Peripherals.findOne({_id: 'thermolator'}).setpoint;
    var messageThermo = ThermoScientific ? 'W SP ' + tempSet + '\r\n' : 
                                           'A032_out_sp_00 ' + tempSet + '\r\n';
    sendToThermo(new Buffer(messageThermo));
    console.log(messageThermo);
};

var textThermo = function textThermo(textThermo) {
    var messageThermo = textThermo + '\r\n';
    sendToThermo(new Buffer(messageThermo));
    console.log(messageThermo);
};

var runThermo = function runThermo(reset) {
    var running = Peripherals.findOne({_id: 'thermolator'}).running;

    if (reset || running) {
        runCommand='W RR -1';
        running=false;
    } else {
        runCommand='W GO 1';
        running=true;
    }

    Peripherals.upsert({_id: 'thermolator'}, { $set : {running: running}});

    var messageThermo = ThermoScientific ?  thermoRun + ' \r\n' :
                                            'A032_out_mode_05 \r\n';
    sendToThermo(new Buffer(messageThermo));
    console.log(messageThermo);
};

var askFluidTemp = function askFluidTemp() {
    var messageThermo = ThermoScientific ? 'R T1\r\n' : 'A032_in_pv_00 \r\n';
    sendToThermo(new Buffer(messageThermo));
    console.log(messageThermo);
};

Peripherals.find({_id: 'thermolator'}).observeChanges{
    changed: funtion changed(id, fields) {
        if (initializing) break;
        var thermolator = Peripherals.findOne({id: id});
        for (let field of fields) {
            switch(field) {
                case 'running':
                        runThermo();
                    break;
                case 'setpoint':
                        updateThermo();
                    break;
                default:
                    // no relevant fields were changed
            }
        }
    }    
}

runThermo('reset'); // reset the thermolator

Meteor.methods({
    textThermo: function(message) {
        textThermo(message);
    }
};

// read ping the thermolator's temperature every second
var query = Meteor.setInterval(askFluidTemp, 1000);

var initializing = false;
