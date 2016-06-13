void readLuxSF(){
 int i=0;
 //while(i<=1){//this code will run twice 
  i++;
  //if (millis()-delayLux>=ms){
    //delayLux=millis();
  delay(ms);
  unsigned int data0, data1;
  
  if (light.getData(data0,data1))
  {
    //Serial.print("data0: ");
    //Serial.print(data0);
    //Serial.print(" data1: ");
    //Serial.print(data1);    
    boolean good;  // True if neither sensor is saturated
    good = light.getLux(gain,ms,data0,data1,lux);
   //Serial.print(" lux: ");
    //Serial.print(lux);
    //if (good) Serial.println(" (good)"); else Serial.println(" (BAD)");
  }
  else
  {
    byte error = light.getError();
    printError(error);
  }
 //}
//}
}

void initializeLuxSF(){
  light.begin();
  unsigned char ID;
  
  if (light.getID(ID))
  {
   // Serial.print("Got factory ID: 0X");
    //Serial.print(ID,HEX);
    //Serial.println(", should be 0X5X");
  }
  else
  {
    byte error = light.getError();
    printError(error);
  }
  gain = 0;
  unsigned char time = 2;
  
  // Serial.println("Set timing...");
  light.setTiming(gain,time,ms);
  //Serial.println("Powerup...");
  light.setPowerUp();
}


void printError(byte error)
  // If there's an I2C error, this function will
  // print out an explanation.
{
  //Serial.print("I2C error: ");
  //Serial.print(error,DEC);
  //Serial.print(", ");
  
  switch(error)// added delay(1); because switch case cannt be empty 
  {
    case 0:
      delay(1);
      //Serial.println("success");
      break;
    case 1:
      delay(1);
      //Serial.println("data too long for transmit buffer");
      break;
    case 2:
      delay(1);
      //Serial.println("received NACK on address (disconnected?)");
      break;
    case 3:
      delay(1);
      //Serial.println("received NACK on data");
      break;
    case 4:
      delay(1);
      //Serial.println("other error");
      break;
    default:
      delay(1);
      //Serial.println("unknown error");
  }
}

