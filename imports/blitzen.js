import { Meteor } from 'meteor/meteor';
// Assets is still in the global namespace as of Meteor 1.3.4.2. Change to import in the future...
import blitzen from 'blitzen';

const data360config = Meteor.settings.data360;

var database = new blitzen.Database(Assets.absoluteFilePath('credentials-crucible.json'));

var log_to_data360 = function timerCallback() {
    var thermolator = Peripherals.findOne({_id: 'thermolator'});
    var chamber     = Peripherals.findOne({_id: 'chamber'});
    var led         = Peripherals.findOne({_id: 'led'});
    var timestamp   = Date.toISOString();

    var readings = {
        organizationId : data360config.organization_id,
        groupId        : data360config.group_id,
        projectId      : data360config.project_id,
        readingList : [
            {
                sensorId: 'board_temp',
                ts: timestamp,
                val: chamber.boardTemp
            },
            {
                sensorId: 'chamber_temp',
                ts: timestamp,
                val: chamber.chamberTemp
            },
            {
                sensorId: 'thermolator_temp',
                ts: timestamp,
                val: thermolator.temperature
            },
            {
                sensorId: 'thermolator_temp_target',
                ts: timestamp,
                val: thermolator.setpoint
            },
            {
                sensorId: 'chamber_pressure',
                ts: timestamp,
                val: chamber.pressure
            },
            {
                sensorId: 'chamber_pressure_target',
                ts: timestamp,
                val: chamber.pressureSetpoint
            },
            {
                sensorId: 'LED_lux',
                ts: timestamp,
                val: led.brightness,
            },
            {
                sensorId: 'LED_lux_target',
                ts: timestamp,
                val: led.setpoint
            },
            {
                sensorId: 'LED_duty_cycle',
                ts: timestamp,
                val: led.dutyCycle
            }
        ]
    };
    database.connect()
        .then(database.postReadings(readings));
};

// log data to blitzen every second
var query = Meteor.setInterval(log_to_data360, 1000);

export default logReadings;
