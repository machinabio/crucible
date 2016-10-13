import { Meteor } from 'meteor/meteor';
import '/imports/peripherals.js';
import '/imports/PID.js';
import '/imports/arduino.js';

const peripheral_name = 'chamber';
var intializing = true;

if (!Peripherals.findOne({ _id: peripheral_name })) {
    Peripherals.insert({ _id : peripheral_name,
                   setpoint : 0,     // the setpoint in PSI (-14..0)
                   pressure : 0,     // the current pressure in PSI
                         v1 : 0,     // the pwm duty cycle 0-100
                         v2 : 0,     // the pwm duty cycle 0-100
                         v3 : 0,     // the pwm duty cycle 0-100
                         v4 : 0,     // the pwm duty cycle 0-100
                      state : 'vent' // can be 'vent','run' or 'hold'
    });
}

var oldTime;
var hysteresisReset = true;
var set_valves = function set_valves() {
    if (Meteor.settings.logging) console.log('Setting valve states');
    var v1 = 0;
    var v2 = 0;
    var v3 = 0;
    var v4 = 0;
    var chamber = Peripherals.findOne({ _id: peripheral_name });
    var pressTarget = chamber.setpoint;
    var pressure = chamber.pressure;
    switch (chamber.running) {
        case 'run':
            // TODO Refactor this code
            if (Math.abs(pressTarget - pressure) > .05) { 
                if (pressure / pressTarget < .97) { // full vacuum
                    v4 = 255;
                    hysteresisReset = true;
                } else {
                    var currentTime = new Date();  // in ms since 1970
                    var timePassed = currentTime - oldTime;
                    var pressureError = PIDPressure(pressure, pressTarget, Number(timePassed), hysteresisReset);
                    hysteresisReset = false;
                    oldTime = currentTime;
                    if (pressureError > 0) {
                        v2 = 10 + Math.abs(pressureError);
                    } else {
                        v3 = 10 + Math.abs(pressureError);
                    }
                }
            }
            break;
        case 'vent':
            v1 = 255;
            break;
        case 'hold':
            // do something
            break;
    }
    Peripherals.update({_id: peripheral_name},  { $set :  { v1 : v1, 
                                                            v2 : v2, 
                                                            v3 : v3, 
                                                            v4 : v4 }});
 };
 
var callbacks = {
    changed: function observe_chamber (id, fields) {
        if (initializing) return;
        var changed_fields = Object.getOwnPropertyNames(fields);
        if (changed_fields.indexOf('setpoint')    != -1 
            || changed_fields.indexOf('pressure') != -1
            || changed_fields.indexOf('running')    != -1)  {
            set_valves();
        }
    }
};

var query = Peripherals.find({_id: peripheral_name}).observeChanges(callbacks);


var initializing = false;