var responseThermo;

(function(){
//Server Side Updated
var sendToArduino = function(message) {
  serialPort.write(message);
};

var sendToThermo = function(message) {
  serialPortThermo.write(message);
};


var SerialPort = Meteor.npmRequire('serialport');

var serialPortThermo = new SerialPort.SerialPort('/dev/ttyUSB0',{
//var serialPortThermo = new SerialPort.SerialPort('/dev/ThermoScientific',{

  baudrate: 19200,
  parser: SerialPort.parsers.readline('\r\n')
   });

var serialPort = new SerialPort.SerialPort('/dev/ttyS0', {
//var serialPort = new SerialPort.SerialPort('/dev/ttyAMA0', {
  baudrate: 115200,
  parser: SerialPort.parsers.readline('\r\n')
});


Meteor.startup(function() {
  console.log("meteor is starting");
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
});


serialPortThermo.on('data',Meteor.bindEnvironment(function(data){
console.log("Direct from Thermo: "+data);
responseThermo=data;
}));


serialPort.on('data', Meteor.bindEnvironment(function(data) {
  var parsedData = JSON.parse(data);
  if (parsedData.messageType === 'getAll') {
    Meteor.call('askFluidTemp' );
    console.log('Board Temp: '+parsedData.TempBoard+
                "C\nTemp Setpoint: "+parsedData.tempTarget+
                " C\nChamber Temp: "+ parsedData.TempChamber+
                " C\nFluid Temp: " +responseThermo+
                " C\nPressure: "+ parsedData.Pressure+
                "psi\nPressure Setpoint: "+parsedData.pressTarget+
                "psi\nLux Setpoint: "+parsedData.luxTarget+
                " \nLUX: "+ parsedData.LUX+
                "\nLED Brightness: "+parsedData.Brightness+"\n");

      var tmpDoc = { 
       created: new Date(),
       messageType: 'getAll',
       tempBoard: parsedData.TempBoard,
       tempChamber: parsedData.TempChamber,
       tempFluid: responseThermo,
       pressure: parsedData.Pressure,
       LUX: parsedData.LUX,
       LEDBrightness: parsedData.Brightness,
       tempTarget: parsedData.tempTarget,
       pressureTarget: parsedData.pressTarget,
       luxTarget: parsedData.luxTarget
     }
     messagePub.added('messages', Random.id(), tmpDoc);
  } 
}));

Meteor.methods({

  updateArduino: function(tempSet,luxSet,pressSet,v1,v2,v3,v4){
    
    var messageToArduino="{\"lS\":"+luxSet+",\"tS\":"+tempSet+",\"pS\":"+pressSet+",\"vS\":["+v1+","+v2+","+v3+","+v4+"]}";
    sendToArduino(new Buffer(messageToArduino));
    console.log(messageToArduino);
    //sendToThermo('W GO 1');
    //console.log('W GO 1');

    var messageThermo="W SP "+ tempSet+ '\r\n';
    console.log(messageThermo);
    sendToThermo(new Buffer(messageThermo));
  },

  textThermo: function(textThermo) {
    var messageThermo=textThermo+'\r\n';
    console.log(messageThermo);
    sendToThermo(new Buffer(messageThermo));
  },

  runThermo: function(thermoRun) {
    var messageThermo=thermoRun+'\r\n';
    console.log(messageThermo);
    sendToThermo(new Buffer(messageThermo));
  },

  askFluidTemp: function(){
    var messageThermo='R T1\r\n';
    sendToThermo(new Buffer(messageThermo));
  },

  message: function(newDoc) {
    messagePub.added('messages', Random.id(), newDoc);
  },

  removeMessage: function(_id) {
    messagePub.removed('messages', _id);
  }
});

}).call(this);

//# sourceMappingURL=app.js.map
