var responseThermo;
var oldTime = 0;
var tempBoard, tempChamber, tempTarget, tempFluid, pressure, pressTarget, LUX, luxTarget;
var oldTempTarget = 0;
var LEDBrightness = 0;
var luxPWM = 0;
var incomingTempTarget, incomingPressTarget, incomingLuxTarget;
var v1 = 0;
var v2 = 0;
var v3 = 0;
var v4 = 0;
var arduinoReady = true;
var messageInQue = false;

var hysteresisReset = true;
var ventStatus = false;

//thermolators
var ThermoScientific = false;
var Julabo = false;

var SerialPort = Meteor.npmRequire('serialport');
var database;
var entitiesFilePath;
var entities;
var credentialsFilePath;

//Initialize NPM Requirements
var blitzen = Npm.require('blitzen');
var fs = Npm.require('fs');
var os = Npm.require('os');



(function() {
  var sendToArduino = function(message) {
    serialPort.write(message);
  };

  var sendToThermo = function(message) {
    serialPortThermo.write(message);
  };

  //Change baudrate in Julabo from 4800 to 19200
  var serialPortThermo = new SerialPort.SerialPort('/dev/ttyUSB0', {
    baudrate: 19200,
    parser: SerialPort.parsers.readline('\r\n')
  });

  var serialPort = new SerialPort.SerialPort('/dev/ttyS0', {
    baudrate: 115200,
    parser: SerialPort.parsers.readline('\r\n')
  });

  Meteor.startup(function() {
    console.log("meteor is starting");
    var exec = Meteor.npmRequire('child_process').exec;


  
    console.log('resetting arduino');
    // TODO: need to make this path relative to the package not absolute
    exec('/home/pi/crucible2/server/gpioReset.py', function(error, stdout, stderr){
      console.log('...done');
      console.log('......Stdout: '+stdout);
      console.log('......Error: '+stderr);
    });
  });


  var messagePub;
  Meteor.publish('messages', function() {
    messagePub = this;
    return this.ready();
  });


  serialPort.on('open', function() {
    console.log('Port Arduino open');
  });

  serialPortThermo.on('open', function() {
    console.log('Port Thermo open');
    ThermoScientific = true;
  });


  serialPortThermo.on('data', Meteor.bindEnvironment(function(data) {
    console.log("Direct from Thermo: " + data + "\n");
    responseThermo = data;
  }));


  serialPort.on('data', Meteor.bindEnvironment(function(data) {


    var parsedData = JSON.parse(data);
    if (parsedData.messageType === 'getAll') {
      Meteor.call('askFluidTemp');

      tempBoard = parsedData.TempBoard;
      tempChamber = parsedData.TempChamber;
      tempTarget = incomingTempTarget;
      //tempTarget=parsedData.tempTarget;
      tempFluid = responseThermo;
      pressure = parsedData.Pressure;
      pressTarget = incomingPressTarget;
      //pressTarget=parsedData.pressTarget;
      LUX = parsedData.LUX;
      luxTarget = incomingLuxTarget;
      //luxTarget=parsedData.luxTarget;
      // LEDBrightness=parsedData.Brightness;

      //writeToConsole();
      console.log('Board Temp: ' + tempBoard +
        "C\nTemp Setpoint: " + tempTarget +
        " C\nChamber Temp: " + tempChamber +
        " C\nFluid Temp: " + tempFluid +
        " C\nPressure: " + pressure +
        " psi\nPressure Setpoint: " + pressTarget +
        " psi\nLux Setpoint: " + luxTarget +
        " \nLUX: " + LUX +
        "\nLED Brightness: " + Math.round(LEDBrightness));


      controlCheck(luxTarget, LUX, pressTarget, pressure, tempTarget, tempFluid);

      //writeToSite();
      var tmpDoc = {
        created: new Date(),
        messageType: 'getAll',
        tempBoard: tempBoard,
        tempChamber: tempChamber,
        tempFluid: responseThermo,
        tempTarget: tempTarget,
        pressure: pressure,
        pressTarget: pressTarget,
        LUX: LUX,
        luxTarget: luxTarget,
        LEDBrightness: Math.round(LEDBrightness)
      };

     //Call Blitzen Logging
     Meteor.call('logReadings',tmpDoc);


      messagePub.added('messages', Random.id(), tmpDoc);
    }
  }));

  Meteor.methods({

    toServer: function(tempSet, luxSet, pressSet, vent, todo) {
      //messageInQue=true;
      incomingLuxTarget = luxSet;
      incomingPressTarget = pressSet;
      incomingTempTarget = tempSet;
      ventStatus = vent;
    },

    updateArduino: function(luxPWM, v1, v2, v3, v4, todo) {
      var messageToArduino = "{\"luxPWM\":" + luxPWM + ",\"vS\":[" + v1 + "," + v2 + "," + v3 + "," + v4 + "],\"rst\":1,\"todo\":" + todo + "}";
      sendToArduino(new Buffer(messageToArduino));
      console.log(messageToArduino);
      //if (oldTempTarget!=tempTarget){
      oldTempTarget = tempTarget;
      Meteor.call('updateThermo', tempTarget);
      //}
    },

    updateThermo: function(tempSet) {
      if (ThermoScientific) {
        var messageThermo = "W SP " + tempSet + '\r\n';
        sendToThermo(new Buffer(messageThermo));
        console.log(messageThermo);
      }
      if (Julabo) {
        var messageThermo = "A032_out_sp_00 " + tempSet + '\r\n';
        sendToThermo(new Buffer(messageThermo));
        console.log(messageThermo);
      }
    },

    textThermo: function(textThermo) {
      var messageThermo = textThermo + '\r\n';
      console.log(messageThermo);
      sendToThermo(new Buffer(messageThermo));
    },

    runThermo: function(thermoRun) {
      if (ThermoScientific) {
        var messageThermo = thermoRun + '\r\n';
        sendToThermo(new Buffer(messageThermo));
        console.log(messageThermo);
      }
      if (Julabo) {
        var messageThermo = "A032_out_mode_05 " + thermoRun + '\r\n';
        sendToThermo(new Buffer(messageThermo));
        console.log(messageThermo);
      }
    },

    askFluidTemp: function() {
      if (ThermoScientific) {
        var messageThermo = 'R T1\r\n';
        sendToThermo(new Buffer(messageThermo));
        console.log(messageThermo);
      }
      if (Julabo) {
        var messageThermo = "A032_in_pv_00 " + '\r\n';
        sendToThermo(new Buffer(messageThermo));
        console.log(messageThermo);
      }
    },

    message: function(newDoc) {
      messagePub.added('messages', Random.id(), newDoc);
    },

    removeMessage: function(_id) {
      messagePub.removed('messages', _id);
  },

  logReadings: function(tmpDoc){




    var entitiesFilePath = '/home/gilthanalas/repos/blitzen/.adsk-data360/entities-crucible.json';

    var entities = readEntitiesFromFile(entitiesFilePath);

    var credentialsFilePath = '/home/gilthanalas/repos/crucible/.adsk-data360/credentials-crucible.json'; 
    //setupDatabase information


    var database = new blitzen.Database(credentialsFilePath);

    var timestamp_before = tmpDoc.created.toISOString();
    var timestamp = tmpDoc.created.toISOString();

    database.connect()
    .then(
      function(result)
      {

          var params = {
            organizationId: entities.organization_id,
            groupId: entities.group_id,
            projectId: entities.project_id,
            readingList: 
            [
              {
                sensorId: 'tempBoard',
                ts: timestamp,
                val: tmpDoc.tempBoard,
              },
              {
                sensorId: 'tempChamber',
                ts: timestamp,
                val: tmpDoc.tempChamber
              },
              {
                sensorId: 'tempFluid',
                ts: timestamp,
                val: tmpDoc.tempFluid,
              },
              {
                sensorId: 'tempBoard',
                ts: timestamp,
                val: tmpDoc.tempBoard,
              },
              {
                sensorId: 'tempTarget',
                ts: timestamp,
                val: tmpDoc.tempTarget
              },
              {
                sensorId: 'pressure',
                ts: timestamp,
                val: tmpDoc.pressure,
              },
              {
                sensorId: 'pressTarget',
                ts: timestamp,
                val: tmpDoc.pressTarget
              },
              {
                sensorId: 'LUX',
                ts: timestamp,
                val: tmpDoc.LUX,
              },
              {
                sensorId: 'luxTarget',
                ts: timestamp,
                val: tmpDoc.luxTarget
              },
              {
                sensorId: 'LEDPower',
                ts: timestamp,
                val: tmpDoc.LEDBrightness,
              }      
            ]
    }


          database.postReadings(params);
      })
      .then(
        function(result)
        {
          //Query parameters to fetch data from Data 360
          var params = 
          {
            organizationId: entities.organization_id,
            groupId: entities.group_id,
            projectId: entities.project_id,
            // sensorList: 'LEDPower',
            startTS: timestamp_before,
            //endTS: '2016-04-27T08:02:55.586Z',
            //rollupFrequency: '1W'
          }

          return database.getReadings(params);
        });  
    }
  });

}).call(this);


controlCheck = function(luxTarget, LUX, pressTarget, pressure, tempTarget, tempFluid) {
  var operation = 0;
  if (Math.abs(luxTarget - LUX) > 50) {
    luxPWM = luxControl(LUX, luxTarget, LEDBrightness);
    LEDBrightness = Number(luxPWM / 255 * 100);
    if (isNaN(LEDBrightness)) { LEDBrightness = 0; }
    operation += 2;

    v1 = 0;
    v2 = 0;
    v3 = 0;
    v4 = 0;

  }

  if (Math.abs(pressTarget - pressure) > .01) {
    operation += 1;

    //if (pressTarget-pressure<-.3){
    if (pressure / pressTarget < .97) {
      v1 = 0;
      v2 = 0;
      v3 = 0;
      v4 = 255;
      hysteresisReset = true;
    } else {
      var date = new Date();
      var currentTime = date.getSeconds() + (date.getMilliseconds() / 1000);
      var timePassed = currentTime - oldTime;
      var pressureError = PIDPressure(pressure, pressTarget, Number(timePassed), hysteresisReset);
      oldTime = currentTime;

      if (pressureError > 0) {
        v1 = 0;
        v2 = 10 + Math.abs(pressureError);
        v3 = 0;
        v4 = 0;
      }

      if (pressureError < 0) {
        v2 = 0;
        v1 = 0;
        v3 = 10 + Math.abs(pressureError);
        v4 = 0;
      }
      hysteresisReset = false;
    }
  }
  if (ventStatus) { v1 = 255;
    v2 = 0; }
  Meteor.call('updateArduino', Math.round(luxPWM), v1, v2, v3, v4, operation);

};




 //Blitzen Read Entities
readEntitiesFromFile = function(
  entitiesFilePath)
{
  try 
  {
    var data = fs.readFileSync(entitiesFilePath, 'utf8');
    var entities = JSON.parse(data);

    if (  entities.organization_id 
      &&  entities.group_id
      &&  entities.project_id)
    {
      console.log('Successfully read entities.'); 
      console.log("organization_id: " + entities.organization_id);
      console.log("group_id: " + entities.group_id);
      console.log("project_id: " + entities.project_id);
    }
    else
    {
      console.log('Error = > Invalid entities file format');
      console.log('Aborting !');
      process.exit(1);
    }

    return entities;
  }
  catch (e) 
  {
    if (e.code === 'ENOENT') 
    {
      console.log(
        'Error => Entities file not found: ' 
        + entitiesFilePath);
    } 
    else 
    {
      console.log("Error reading entities file: " + e.message);
    }

    console.log('Aborting !');
    process.exit(1);
  }
}