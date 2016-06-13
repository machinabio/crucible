
void LEDPWM(){
  while (LEDOn){
    analogWrite(CrucibleLightPin, ledBrightness);
    ledBrightness = ledBrightness + fadeAmount;
    if(ledBrightness<=0){
      LEDOn=false;
    }
    if (ledBrightness <= 00 || ledBrightness == 255) {
      fadeAmount = -fadeAmount ;
    }
    delay(delaytime);
  }  
}

void initializeLED(){
  pinMode(ledPin, OUTPUT);
}

