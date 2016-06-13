void pid(){
  float luxError= (luxTarget-lux);
  float kP=.001;
  int counter=0;
  float limits=15;
  if(lux==0 && ledBrightness> 10){ lux=30000;}
  while(luxError>limits || luxError <-limits){
    ledBrightness+=(kP*luxError);
    if (ledBrightness<0){ledBrightness=0;}
    if (ledBrightness>100){ledBrightness=80;}
    analogWrite(CrucibleLightPin, (ledBrightness*255.00/100.0));
    readLuxSF();
    if(lux==0 && ledBrightness> 10){ lux=30000;}
    luxError= (luxTarget-lux);
    counter++;
    if(counter>50){
      luxError=0;
    }
 }
  //Serial.print("Lux Target: ");//Serial.print(luxTarget);//Serial.print(" Lux Read: ");//Serial.println(lux);
  //Serial.print("ERROR: ");//Serial.println(luxError);
  //Serial.print("LED Power: ");//Serial.println(ledBrightness);//Serial.println(counter);
  counter=0;
}

