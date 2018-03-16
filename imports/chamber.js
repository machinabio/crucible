import { Meteor } from 'meteor/meteor';
import '/imports/peripherals.js';
import '/imports/PID.js';
import '/imports/arduino.js';

const peripheral_name = 'chamber';
var intializing = true;

if (!Peripherals.findOne(peripheral_name)) {
    Peripherals.insert({
        _id: peripheral_name,
        setpoint: 0, // the setpoint in PSI (-14..0)
        pressure: 0, // the current pressure in PSI
        v1: 0, // the pwm duty cycle 0-100
        v2: 0, // the pwm duty cycle 0-100
        v3: 0, // the pwm duty cycle 0-100
        v4: 0, // the pwm duty cycle 0-100
        running: 'vent' // can be 'vent','run' or 'h'
    });
}

var oldTime;
var hysteresisReset = true;

Peripherals.find(peripheral_name).observeChanges({
    changed: function observe_chamber(id, fields) {
        if (initializing) return;
        let changed_fields = Object.getOwnPropertyNames(fields);
        if (changed_fields.indexOf('setpoint') != -1 || changed_fields.indexOf('pressure') != -1 || changed_fields.indexOf('running') != -1) {
            set_valves();
        }
    }
});
initializing = false;

function set_valves() {
    if (Meteor.settings.logging) console.log('Setting valve states');
    let chamber = Peripherals.findOne(peripheral_name);
    let pressTarget = chamber.setpoint;
    let pressure = chamber.pressure;
    //let CLOSED = 0;
    let v1 = 0;
    let v2 = 0;
    let v3 = 0;
    let v4 = 0;
    switch (chamber.running) {
        case 'run':
            // TODO Refactor this code
            if (Math.abs(pressTarget - pressure) > .05) {
                if (pressure / pressTarget < .97) { // full vacuum
                    v4 = 255;
                    hysteresisReset = true;
                } else {
                    let currentTime = new Date(); // in ms since 1970
                    let timePassed = currentTime - oldTime;
                    let pressureError = PIDPressure(pressure, pressTarget, Number(timePassed), hysteresisReset);
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
            v3 = 255;

            break;
        case 'hold':
            // do something
            v1 = 0;
            v2 = 0;
            v3 = 0;
            v4 = 0;
            break;
        case 'pull_vac':
          v1 = 255;
          v2 = 0;
          v3 = 0;
          v4 = 255;
          break;
        case 'pull_gas':
          v1 = 0;
          v2 = 255;
          v3 = 0;
          v4 = 0;
          break;
        case 'v1_ON':
          v1 = 255;
          break;
        case 'v1_OFF':
          v1 = 0
          break;
        case 'v2_ON':
          v2 = 255;
          break;
        case 'v2_OFF':
          v2 = 0
          break;
        case 'v3_ON':
          v3 = 255;
          break;
        case 'v3_OFF':
          v3 = 0
          break;
        case 'v4_ON':
          v4 = 255;
          break;
        case 'v4_OFF':
          v4 = 0;
          break;
        case "sweep":
          let valves = [v1, v2, v3, v4];
          for (i = 0; i < 4; i++){
            let valve = valves[i];
            for (i = 0; i <= 255; i+=2) {
              valve = i;
              setTimeout(function(){}, 5000);
          }
        }

    }

    /*
    function protocol_1() {
      if (Meteor.settings.logging) console.log('Starting protocol 1');
      //Start a timer and run the 'run' state for 10 minutes
      //record pressure and calculate rms pressure
      let timer10start = new Date();
      if (Meteor.settings.logging) console.log('10min timer started.');

      function timer10(){
        let timer10curr = new Date();
        let timerProgress = timer10curr - timer10start;
        return timerProgress;
      }

      if (Meteor.settings.logging) console.log('Pressurizing.');
      if timer10() < 600000 {
        // run chamber as normal
      }
      let finalPressure = chamber.pressure; //output this value
      let rmsPressure = finalPressure/Math.sqrt(2);
      let rmsTimerStart = new Date();
      if (Meteor.settings.logging) {
        console.log('Final pressure: ' + String(chamber.pressure));
        console.log('Holding chamber.');
        console.log('Starting depressurization timer.');
      }
      //begin holding here
      if (chamber.pressure < rmsPressure) {
        //record time and vent
        let rmsTimerEnd = new Date();
        let rmsTime = rmsTimerEnd - rmsTimerStart;
      }

    }
    */


    Peripherals.update(peripheral_name, {
        $set: {
            v1: v1,
            v2: v2,
            v3: v3,
            v4: v4
        }
    });
}
