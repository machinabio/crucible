var responseThermo;
var oldTime=0;
var tempBoard, tempChamber, tempTarget, tempFluid, pressure, pressTarget, LUX, luxTarget;
var LEDBrightness=0,luxPWM=0;
var incomingTempTarget, incomingPressTarget, incomingLuxTarget;
var v1=0,v2=0,v3=0,v4=0;
var arduinoReady=true;
var messageInQue=false;

var hysteresisReset=true;
var ventStatus=false;

(function(){

//Server Side Updated
var sendToArduino = function(message) {
  serialPort.write(message);
};

var sendToThermo = function(message) {
  serialPortThermo.write(message);
};

var SerialPort = Meteor.npmRequire('serialport');

//var serialPortThermo = new SerialPort.SerialPort('/dev/ThermoScientific',{
var serialPortThermo = new SerialPort.SerialPort('/dev/ttyUSB0',{
  baudrate: 19200,
  parser: SerialPort.parsers.readline('\r\n')
   });

var serialPort = new SerialPort.SerialPort('/dev/ttyS0', {
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

    tempBoard=parsedData.TempBoard;
    tempChamber=parsedData.TempChamber;
    tempTarget=incomingTempTarget;
    //tempTarget=parsedData.tempTarget;
    tempFluid=responseThermo;
    pressure=parsedData.Pressure;
    pressTarget=incomingPressTarget;
    //pressTarget=parsedData.pressTarget;
    LUX=parsedData.LUX;
    luxTarget=incomingLuxTarget;
    //luxTarget=parsedData.luxTarget;
   // LEDBrightness=parsedData.Brightness;
    arduinoReady=parsedData.Ready;

    //writeToConsole();
    console.log('Board Temp: '+tempBoard+
            "C\nTemp Setpoint: "+tempTarget+
            " C\nChamber Temp: "+ tempChamber+
            " C\nFluid Temp: " +tempFluid+
            " C\nPressure: "+ pressure+
            " psi\nPressure Setpoint: "+pressTarget+
            " psi\nLux Setpoint: "+luxTarget+
            " \nLUX: "+ LUX+  
            "\nLED Brightness: "+Math.round(LEDBrightness)+
            "\nMessage Arduino: "+arduinoReady+
            "\n");


    controlCheck(luxTarget,LUX,pressTarget,pressure,tempTarget,tempFluid);      
  
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
     }
     messagePub.added('messages', Random.id(), tmpDoc);
  } 
}));

Meteor.methods({

  toServer: function(tempSet,luxSet,pressSet,vent,todo){
    //messageInQue=true;
    incomingLuxTarget=luxSet;
    incomingPressTarget=pressSet;
    incomingTempTarget=tempSet;
    ventStatus=vent;
  },

  updateArduino: function(luxPWM,v1,v2,v3,v4,todo){
    var messageToArduino="{\"luxPWM\":"+luxPWM+",\"vS\":["+v1+","+v2+","+v3+","+v4+"],\"rst\":1,\"todo\":"+todo+"}";
      sendToArduino(new Buffer(messageToArduino));
      console.log(messageToArduino);
      if (!todo){
        Meteor.call('updateThermo',tempTarget);
      }
  },
  
  updateThermo: function(tempSet) {
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


controlCheck = function(luxTarget,LUX,pressTarget,pressure,tempTarget,tempFluid){
  var operation=0;
  if (Math.abs(luxTarget-LUX)>50){
    luxPWM=luxControl(LUX,luxTarget,LEDBrightness);
    LEDBrightness=Number(luxPWM/255*100);
    if (isNaN(LEDBrightness)){LEDBrightness=0;}
    operation+=2;
    
    v1=0; v2=0; v3=0;v4=0;

  }

  if(Math.abs(pressTarget-pressure)>.01){
    operation+=1;

    if (pressTarget-pressure<-1){
      v1=0;
      v2=0;
      v3=0;
      v4=255;
      hysteresisReset=true;
    }
      else{
      var date=new Date();
      var currentTime=date.getSeconds()+(date.getMilliseconds()/1000);
      var timePassed=currentTime-oldTime;
      var pressureError=PIDPressure( pressure, pressTarget, Number(timePassed),hysteresisReset);
      oldTime=currentTime;

      if (pressureError>0){
        v1=0;
        v2=Math.abs(pressureError);
        v3=0;
        v4=0;
      }

      if (pressureError<0){
        v2=0;
        v1=0;
        v3=Math.abs(pressureError);
        v4=0;
      }
      hysteresisReset=false;
    }
  }
  if (ventStatus){v1=255;v2=0;}
  Meteor.call('updateArduino', Math.round(luxPWM), v1,v2,v3,v4,operation);

 }