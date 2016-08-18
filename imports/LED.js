import '/imports/peripherals.js';

var intializing = true;
const peripheral_name = 'led';
const              kP = 0.0008;

// make sure the led record is configured
if (!Peripherals.findOne({_id: peripheral_name})) {
	Peripherals.insert({ _id : peripheral_name,    
                   setpoint : 0, // the setpoint in Lux
                 brightness : 0, // the brightness in Lux
                  dutyCycle : 0  // the pwm duty cycle 0-100
    });
}

var set_lux = function set_lux(){
    var led = Peripherals.findOne({_id: peripheral_name});
    var ledPower  = led.dutyCycle;
    var luxTarget = led.setpoint;
    var luxActual = led.brightness;

    if ( ledPower>10 && luxActual==0 ) luxActual=30000; // corrects for an overflow error?

    var luxError = luxTarget-luxActual;
   
    ledPower += kP*luxError;

    if (ledPower<0) ledPower=0;
    if (ledPower>100) ledPower=70;

    Peripherals.update({_id: peripheral_name}, { $set : {dutyCycle : ledPower}});
};

var callbacks = {
    changed: function observe_led (id, fields) {
        if (initializing) return;
        var changed_fields = Object.getOwnPropertyNames(fields);
        if ( changed_fields.indexOf('setpoint')      != -1
             || changed_fields.indexOf('brightness') != -1) {
            console.log('Change in LED field '+fields);
            set_lux();
        }
    }
};

var query = Peripherals.find({_id: peripheral_name}).observeChanges(callbacks);
intializing = false;
