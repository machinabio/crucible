
void readPressure() {
 
 double sensorValue = analogRead(pressurePin);
 double Vout=sensorValue*(Vs/1023.0);
 //Differential
 //vacPressure= ((Vout/Vs)-0.04)/(0.00369)*0.145038;//Straight from Sensor formula (*145038 converts KPa to PSI)
 
 //absolute
 vacPressure= ((Vout/Vs)-.92)/0.00765*0.145038;//Straight from Sensor formula (*145038 converts KPa to PSI)
 //Serial.println("");Serial.println("");
 //Serial.print(" P = ");
 //Serial.print(vacPressure);
 //Serial.println(" psi");

 
}
