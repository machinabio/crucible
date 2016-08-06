void checkCommunication() {
  byte index = 0;
  while (Serial1.available() > 0) {
    if (index < 64) {
      delay(5);
      inChar = Serial1.read(); // Read a character
      inMeteor[index] = inChar; // Store it
      index++; // Increment where to write next
      inMeteor[index] = '\0'; // Null terminate the string
    }
    messageFull = true;
  }
  if (messageFull) {
    messageFull = false;
    parseJson();
  }
}

void parseJson() {
  int luxPWM=0;
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(inMeteor);

  if (!root.success()) {
    // fail to parse
    return;
  }
 
  resetFun  = root["rst"];
  luxPWM    = root["luxPWM"];
  valve1    = root["vS"][0];
  valve2    = root["vS"][1];
  valve3    = root["vS"][2];
  valve4    = root["vS"][3];
  operation = root["todo"];
  //tempTarget = root["tS"];
  //luxTarget = root["lS"];
  //pressureTarget = root["pS"];
  
  if (resetFun){// if true arduino will keep running
    resetWatchDog=millis();
  }
  
  if(operation ==0){
    readPressure();//updates vacPressure
    readLuxSF();
    //TMP75Read();//update Temp
  }
  
  if (operation == 1){
    readPressure();//updates vacPressure
    analogWrite(valvePin1, valve1);  analogWrite(valvePin2, valve2);   analogWrite(valvePin3, valve3);  analogWrite(valvePin4, valve4);
  }
  if (operation == 2){
    readPressure();//updates vacPressure
    readLuxSF();
    analogWrite(CrucibleLightPin, luxPWM);
  }
  if (operation == 3){
    readLuxSF();
    readPressure();//updates vacPressure
    analogWrite(CrucibleLightPin, luxPWM);
    analogWrite(valvePin1, valve1);  analogWrite(valvePin2, valve2);   analogWrite(valvePin3, valve3);  analogWrite(valvePin4, valve4);
  }
  
  printReadAll();
  oldMillisLoop=millis();
  resetWatchDog=millis();
}

void printReadAll(){
    Serial1.print("\n{");
    Serial1.print("\n\"TempBoard\":");
    Serial1.print(temp);
    Serial1.print(",");
    Serial1.print("\n\"TempChamber\":");
    Serial1.print(0);
    Serial1.print(",");
//    Serial1.print("\n\"tempTarget\":");
//    Serial1.print(tempTarget);
//    Serial1.print(",");
    Serial1.print("\n\"Pressure\":");
    Serial1.print(vacPressure);
    Serial1.print(",");
//    Serial1.print("\n\"pressTarget\":");
//    Serial1.print(pressureTarget);
//    Serial1.print(",");
    Serial1.print("\n\"LUX\":");
    Serial1.print(lux);
    Serial1.print(",");
//    Serial1.print("\n\"luxTarget\":");
//    Serial1.print(luxTarget);
//    Serial1.print(",");
//    Serial1.print("\n\"Brightness\":");
//    Serial1.print(ledBrightness);
//    Serial1.print(",");
    Serial1.print("\n\"Ready\":");
    Serial1.print(readyToRead);
    Serial1.print(",");
    Serial1.print("\n\"messageType\":\"getAll\"");
    Serial1.println("\n}");
}


