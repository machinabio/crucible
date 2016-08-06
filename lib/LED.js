import './peripheral.js';
import './PID.js';

var initializing = true;
var query = null;
var kP=.0008;

// make sure the led record is configured
var record = Peripherals.findOne({_id: 'led'});
if (!record) {
	record = {
		_id: 'led',    
		setpoint: 0,   // the setpoint in lux
		brightness: 0, // the brightness in lux
		dutyCycle: 0,  // the pwm duty cycle 0-100
	};
	Peripheral.upsert({_id: 'led'}, { $set : record});
}

var luxControl = function luxControl(luxActual, luxTarget, ledPower){
    ledPower  = ledPower  ? ledPower  : Peripherals.findOne({_id: 'led'}).dutyCycle;
    luxTarget = luxTarget ? luxTarget : Peripherals.findOne({_id: 'led'}).setpoint;
    luxActual = luxActual ? luxActual : Peripherals.findOne({_id: 'led'}).brightness;

    if (ledPower>10 && luxActual==0) luxActual=30000; // corrects for an overflow error?

    var luxError= luxTarget - luxActual;
   
    ledPower += kP*luxError;

    if (ledPower < 0) ledPower=0;
    if (ledPower > 100) ledPower=70;

    Peripheral.upsert({_id: 'led'}, { $set : {dutyCycle : ledPower}});

    return ledPower;
}

var query = Meteor.setInterval(luxControl, 1000);