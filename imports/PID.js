var XPos = 0;
var SapmpleSec = 300;
var OldSampletime = 0;

//var ProcessValue = 0;
var outputPos = 0;
var outputNeg = 0;

//Low efficiency so we can see the output value on the graph.
var efficiency = 0.05;
var loss = 0.8;

//timers interval time in Sec
var Dt = 0.01;

var setPointOld = 0;
var outputPosOld = 0;
var outputNegOld = 0;
var processValueOld = 0;

var preError = 0;
var integral = 0;
var processValueHyst = 0;
var Output = 0;

//Startup SetPoint
//var SetPoint = -13;
//Progressive
var Kp = 6.;    // 5.0
//Integral
var Ki = 0.3;   // 0.3
//Derivative
var Kd = 0.01;  // 0.01

var Hysteresis = 1;
var Acceleration = 100;

//var interval = 10;
var oldTime=0;

/*
 * ProcessValue
 * Current process value.
 * TimeInterval
 * Time since last update in second.
 */

//process value= pressure reading
//setPoint= desired pressure,
//time interval
PIDPressure = function (ProcessValue, SetPoint, TimeInterval, hysteresisReset) {
    if(hysteresisReset){
        processValueHyst=0;
        integral=0;
        preError=0;
        Output=0;
        oldOutput=0;
    }
    if(isNaN(SetPoint)){SetPoint=0;}
    if(isNaN(ProcessValue)){ProcessValue=0;}

    processValueHyst += (ProcessValue - processValueHyst) * Hysteresis;
    var error = (SetPoint - processValueHyst);
    //var error = (SetPoint - ProcessValue);
    integral += error * TimeInterval;
    var derivative = ((error - preError) / TimeInterval);
    var oldOutput=Output;
    oldOutput += Number((Kp * error) + (Ki * integral) + (Kd * derivative));



    if (oldOutput>Acceleration){
    	oldOutput=Acceleration;
    }
	
	else if(oldOutput< -Acceleration){
		oldOutput=-Acceleration;
	}    	

	Output=oldOutput-Output;


    preError = error;

    var valValue=Math.round(Number(Output*255/100));
    if(valValue>255){valValue=255;}
    if(valValue<-255){valValue=-255;}
    console.log("Error: "+Math.round(error*1000)/1000+" Output: "+valValue);

    return(valValue);

};

export default PIDPressure;


