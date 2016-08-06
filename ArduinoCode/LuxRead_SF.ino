void readLuxSF() {
  int i=0;
  i++;
  delay(ms);
  unsigned int data0, data1;
  
  if (light.getData(data0,data1)) {
    boolean good;  // True if neither sensor is saturated
    good = light.getLux(gain,ms,data0,data1,lux);
  } else {
    byte error = light.getError();
    printError(error);
  }
}

void initializeLuxSF(){
  light.begin();
  unsigned char ID;
  
  if (!light.getID(ID)) {
    byte error = light.getError();
    printError(error);
  }
  gain = 0;
  unsigned char time = 2;
  
  light.setTiming(gain,time,ms);
  light.setPowerUp();
}

// If there's an I2C error, this function will
// print out an explanation.
void printError(byte error) {
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

