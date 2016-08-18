import '/imports/peripherals.js';
import 'serialport';

const peripheral_name = 'thermolator';
const ThermoScientific = false; // if this is false, we assume there's a Julabo thermolator connected

// Turn off callbacks during initialization
var intializing = true;

// Initialize the thermolator now
if (!Peripherals.findOne({ _id: peripheral_name })) {
  Peripherals.insert({
    _id: peripheral_name,
    temperature: 25, // in C
    setpoint: 25, // in C
    running: false // true = running, false = stopped
  });
}

if (!Meteor.settings.debug) {
  var serialPort = new serialport.SerialPort('/dev/ttyUSB0', {
    baudrate: 19200,
    parser: SerialPort.parsers.readline('\r\n')
  });

  serialPort.on('open', function() {
    console.log('Port Thermo open');
  });

  serialPort.on('data', Meteor.bindEnvironment(function(data) {
    var reading = Number.parseFloat(data);
    if (reading) Peripherals.update({ _id: peripheral_name }, { $set: { temperature: reading } });
  }));

  var send_to_thermolator = function send_to_thermolator(message) {
    serialPort.write(Buffer.from(message + '\r\n'));
  };

  var update_setpoint = function update_setpoint() {
    var tempSet = Peripherals.findOne({ _id: peripheral_name }).setpoint;
    var messageThermo = ThermoScientific ? 'W SP ' + tempSet :
      'out_sp_00 ' + tempSet;
    send_to_thermolator(messageThermo);
  };

  var thermolator_off = function thermolator_off() {
    var command = ThermoScientific ? 'W RR -1' :
      'out_mode_05 0';
    send_to_thermolator(command);
  };

  var thermolator_on = function thermolator_on() {
    var command = ThermoScientific ? 'W GO 1' :
      'out_mode_05 1';
    send_to_thermolator(command);
  };

  var get_temperature = function get_temperature() {
    var messageThermo = ThermoScientific ? 'R T1' : 'in_pv_00';
    send_to_thermolator(messageThermo);
  };

  thermolator_off('reset'); // make sure the thermolator is not running)

  Peripherals.find({ _id: 'thermolator' }).observeChanges({
  changed: function changed(id, fields) {
    if (initializing) return;
    var thermolator = Peripherals.findOne({ id: id });
    for (let field of fields.getOwnPropertyNames()) {
      switch (field) {
        case 'running':
          fields.running ? thermolator_on() : thermolator_off();
          break;
        case 'setpoint':
          update_setpoint();
          break;
        default:
          // no relevant fields were changed
      }
    }
  }
});

// read ping the thermolator's temperature every second
var query = Meteor.setInterval(get_temperature, 1000);
}

initializing = false;
