import '/imports/peripherals.js';
import '/imports/arduino.js';

var intializing = true;
const peripheral_name = 'led';
const kP = 0.0008;

// make sure the led record is configured
if (!Peripherals.findOne(peripheral_name)) {
    Peripherals.insert({
        _id: peripheral_name,
        setpoint: 0, // the setpoint in Lux
        brightness: 0, // the brightness in Lux
        dutyCycle: 0 // the pwm duty cycle 0-100
    });
}

Peripherals.find({ _id: peripheral_name }).observeChanges({
    changed: function observe_led(id, fields) {
        if (initializing) {
            if (Meteor.settings.logging) console.warn('caught change in LED but still initializing');
            return;
        }
        let changed_fields = Object.getOwnPropertyNames(fields);
        if (changed_fields.indexOf('setpoint') != -1 || changed_fields.indexOf('brightness') != -1) {
            if (Meteor.settings.logging) console.log('Change in LED field(s):', fields);
            set_lux();
        }
    }
});
intializing = false;

function set_lux() {
    let led = Peripherals.findOne(peripheral_name);
    let ledPower = led.dutyCycle;
    let luxTarget = led.setpoint;
    let luxActual = led.brightness;

    if (ledPower > 10 && luxActual == 0) luxActual = 30000; // corrects for an overflow error?

    let luxError = luxTarget - luxActual;

    ledPower += kP * luxError;

    if (ledPower < 0) ledPower = 0;
    if (ledPower > 100) ledPower = 70;

    Peripherals.update(peripheral_name, { $set: { dutyCycle: ledPower } });
}
