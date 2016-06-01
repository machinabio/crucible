var XPos = 0;
var SapmpleSec = 300;
var OldSampletime = 0;

var ProcessValue = 0;
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
var SetPoint = 300;
//Progressive
var Kp = 0.5;
//Integral
var Ki = 0.25;
//Derivative
var Kd = 0.05;

var Hysteresis = 1;
var Acceleration = 10;

/*
 * ProcessValue
 * Current process value.
 * TimeInterval
 * Time since last update in second.
 */
var Update = function (ProcessValue, TimeInterval) {
    processValueHyst += (ProcessValue - processValueHyst) * Hysteresis;

    var error = SetPoint - processValueHyst;
    integral += error * TimeInterval;
    var derivative = ((error - preError) / TimeInterval);

    Output += constrain(((Kp * error) + (Ki * integral) + (Kd * derivative)) - Output, -Acceleration, Acceleration);

    preError = error;
    console.log("Error: "+error);

};

//Calculate the new process value with random values.
var Process = function (Current) {
  //loss = random(-2, 1);
  return (Current - loss) + (Output * efficiency);
};
