import { Meteor } from 'meteor/meteor';
import '/imports/peripherals.js';

const peripheral_name = 'thermolator';

// Turn off callbacks during initialization
var intializing = true;

// Initialize the thermolator now
if (!Peripherals.findOne(peripheral_name)) {
    Peripherals.insert({
        _id: peripheral_name,
        temperature: 25, // in C
        setpoint: 25, // in C
        running: false // true = running, false = stopped
    });
}

var initSerialPort = function () {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using virtual-serialport for thermolator');
    return require('virtual-serialport')
  }

  return require('serialport');
};

if (Meteor.settings.thermolator) {
    var SerialPort = initSerialPort();

    const ThermoScientific = (Meteor.settings.thermolator.model.toLowerCase() == 'thermoscientific'); // if this is false, we assume there's a Julabo thermolator connected
    console.log("thermolator model ", ThermoScientific ? "Thermoscientific" : "Julabo");

    var port = new SerialPort.SerialPort(Meteor.settings.thermolator.port, {
        baudrate: Meteor.settings.thermolator.baudrate,
        parser: SerialPort.parsers.readline('\r\n')
    });

    port.on('open', function onOpen() {
      console.log('Thermo port open on:', Meteor.settings.thermolator.port);
    });

    port.on('data', function (data) {
      console.log('Thermo Receive:', data);
    });

    port.on('data', Meteor.bindEnvironment(function(data) {
        let reading = parseFloat(data);
        if (reading) {
            Peripherals.update(peripheral_name, {
                $set: { temperature: reading }
            });
            if (Meteor.settings.logging) console.log('Received data from thermolator ', reading);
        }
    }));

    thermolator_off();

    Peripherals.find(peripheral_name).observeChanges({
        changed: function changed(id, fields) {
            if (initializing) return;
            let thermolator = Peripherals.findOne(id);
            let changed_fields = Object.getOwnPropertyNames(fields);
            for (let field of changed_fields) {
                switch (field) {
                    case 'running':
                        if (Meteor.settings.logging) console.log('toggled thermolator running');
                        fields.running ? thermolator_on() : thermolator_off();
                        break;
                    case 'setpoint':
                        if (Meteor.settings.logging) console.log('updated thermolator setpoint');
                        update_setpoint();
                        break;
                    default:
                        // no relevant fields were changed
                }
            }
        }
    });

    Meteor.setInterval(get_temperature, 1000);

    // functions are hoisted
    function update_setpoint() {
        let tempSet = Peripherals.findOne(peripheral_name).setpoint;
        let messageThermo = ThermoScientific ? 'W SP ' : 'out_sp_00 ';
        messageThermo += tempSet;
        send_to_thermolator(messageThermo);
    };

    function thermolator_off() {
        let command = ThermoScientific ? 'W RR -1' : 'out_mode_05 0';
        send_to_thermolator(command);
    };

    function thermolator_on() {
        let command = ThermoScientific ? 'W GO 1' : 'out_mode_05 1';
        send_to_thermolator(command);
    };

    function get_temperature() {
        let messageThermo = ThermoScientific ? 'R T1' : 'in_pv_00';
        send_to_thermolator(messageThermo);
    };

    function send_to_thermolator(message) {
        if (port.isOpen()) {
            port.write(message + '\r\n');
        }
        if (Meteor.settings.logging) console.log('Sending data to thermolator ', message);
    };
}

initializing = false;
