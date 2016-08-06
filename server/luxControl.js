luxControl = function(LUX, luxTarget,ledBrightness){

    if(ledBrightness>10 && LUX==0){LUX=30000;}
    var luxError=(luxTarget-LUX);
    var kP=.0008;
    ledBrightness+=(kP*luxError);
    if(ledBrightness<0){ledBrightness=0;}
    if(ledBrightness>100){ledBrightness=70;}//avoid saturating the sensor
    var powerLed=ledBrightness*255/100;

//    console.log("LUX: "+LUX+", Target: "+luxTarget+", Error: "+luxError+", Power: "+powerLed)
    return(powerLed);
}
