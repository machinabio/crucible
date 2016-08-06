import './peripherals.js'

var Blitzen = Meteor.npmRequire('blitzen');
var database = new Blitzen.Database(Assets.absoluteFilePath('credentials-crucible.json'));

var entities = {
    organization_id: "d58983a1fd3aa3e8bf4e1ae4a7b2",
    group_id: "2b8084cd855fa749b7113eba1849",
    project_id: "2bbb4f6099676a77d70cfdc4254e"
};

var logReadings = function logReadings(tmpDoc) {
    var timestamp_before = tmpDoc.created.toISOString();
    var timestamp = tmpDoc.created.toISOString();

    database.connect().then(function(result) {
        var params = {
            organizationId: entities.organization_id,
            groupId: entities.group_id,
            projectId: entities.project_id,
            readingList: [
                {
                    sensorId: 'boardTemp',
                    ts: timestamp,
                    val: tmpDoc.tempBoard
                },
                {
                    sensorId: 'chamberTemp',
                    ts: timestamp,
                    val: tmpDoc.tempChamber
                },
                {
                    sensorId: 'fluidTemp',
                    ts: timestamp,
                    val: tmpDoc.tempFluid
                },
                {
                    sensorId: 'fluidTargetTemp',
                    ts: timestamp,
                    val: tmpDoc.tempTarget
                },
                {
                    sensorId: 'pressure',
                    ts: timestamp,
                    val: tmpDoc.pressure
                },
                {
                    sensorId: 'targetPressure',
                    ts: timestamp,
                    val: tmpDoc.pressTarget
                },
                {
                    sensorId: 'lux',
                    ts: timestamp,
                    val: tmpDoc.lux,
                },
                {
                    sensorId: 'luxTarget',
                    ts: timestamp,
                    val: tmpDoc.luxTarget
                },
                {
                    sensorId: 'LEDPower',
                    ts: timestamp,
                    val: tmpDoc.LEDBrightness
                }
            ]
        };
        database.postReadings(params);
    });
}

var timerCallback = function timerCallback() {
        Peripherals.upsert({_id: 'chamber'}, { $set : { boardTemp  : tempBoard}});
        Peripherals.upsert({_id: 'chamber'}, { $set : { pressure   : pressure}});
        Peripherals.upsert({_id: 'led'}, { $set : {brightness: lux}});

        var tempFluid   = Peripherals.findOne({_id: 'thermolator'}).temperature;
        var tempTarget  = Peripherals.findOne({_id: 'thermolator'}).setpoint;
        var pressTarget = Peripherals.findOne({_id: 'chamber'}).setpoint;
        var luxTarget   = ;

    var tmpDoc = {
        created: new Date(),
        messageType: 'getAll',
        tempBoard  : Peripherals.findOne({_id: 'chamber'}).boardTemp,
        tempChamber: Peripherals.findOne({_id: 'chamber'}).chamberTemp,
        tempFluid  : Peripherals.findOne({_id: 'thermolator'}).temperature,
        tempTarget : Peripherals.findOne({_id: 'thermolator'}).setpoint,
        pressure   : Peripherals.findOne({_id: 'chamber'}).pressure,
        pressTarget: Peripherals.findOne({_id: 'chamber'}).pressureSetpoint,,
        lux        : Peripherals.findOne({_id: 'led'}).brightness,
        luxTarget  : Peripherals.findOne({_id: 'led'}).setpoint,
        LEDBrightness: Math.round(Peripherals.findOne({_id: 'led'}).dutyCycle)
    };

    logReadings(tmpDoc);
}

// log data to blitzen every second
var query = Meteor.setInterval(timerCallback, 1000);

export default logReadings;
