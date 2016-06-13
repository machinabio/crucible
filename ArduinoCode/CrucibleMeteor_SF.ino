//////////////////
//
//                   :MMNmhs+.        
//                  `odM`````         
//                  `oMMmmdyo-        
//         `   `/md+`-MMN.    `.  `   
//       -`N-` dMMMd`.mM/  :yyo. `N.- 
//       :hdh.-dMMyddohM/yNh/`  `yhd/ 
//       soys   ..  -dMMMo`      oyss`
//       `/ys`    :hNydM+hms-    os+` 
//       -ydy+. -d+.  yM  `/ho `+smy: 
//         /hN:s.     sN     `s-Nh+`  
//         `.-hNo            +Nd:..   
//            `                `                  
//
///////////////////

#include <Wire.h>
#include <ArduinoJson.h>
#include <SparkFunTSL2561.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_TSL2561_U.h>
#include <SoftReset.h>
Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_FLOAT, 12345);

//MAX31865
#include <SPI.h>
#include <MAX31865.h>


///////////
//Variables
///////////

//Communication w/ Meteor
char inMeteor[64];
char inChar;
boolean messageFull = false;
StaticJsonBuffer<200> jsonBuffer;

//TMP75 (Temp Board)
int TMP75_Address = 0x4F;
int decPlaces = 1;
int numOfBytes = 2;
byte configReg = 0x01;    // Address of Configuration Register
byte bitConv = B01100000; // Set to 12 bit conversion
byte rdWr = 0x01;         // Set to read write
byte rdOnly = 0x00;       // Set to Read
float temp = 0;

float tempTarget = 0;


//MAX31865 (Temp Chamber)
#define RTD_CS_PIN   SS
MAX31865_RTD rtd( MAX31865_RTD::RTD_PT100, RTD_CS_PIN );

//LUX
double lux = 0;
int luxTarget = 0;
SFE_TSL2561 light;
boolean setNewLux = false;
boolean gain;     // Gain setting, 0 = X1, 1 = X16;
unsigned int ms;  // Integration ("shutter") time in milliseconds


//Presure (Chamber)
double Vs = 5; //Voltage arduino 5V
int  pressurePin = 11;
double vacPressure = 0;
double pressureTarget = 0;
boolean setNewPressure = false;


//LED
int ledPin = 13; //testing meteor
int CrucibleLightPin = 5;
float ledBrightness = 0; // 0-255 0-38V
int fadeAmount = 3;    // how many points to fade the LED by
int delaytime = 10;
boolean LEDOn = false;
boolean setNewLEDPower = false;


//millis()
unsigned long oldMillisLoop=0;
unsigned long delayLux=0;
unsigned long resetWatchDog=0;
unsigned long watchDogTimer=30000;
int interval= 5000;

//Valves
int valvePin1 = 6;     // Vent
int valvePin2 = 9;     // Gas
int valvePin3 = 10;    // Vacuum Orifice
int valvePin4 = 11;    // Vacuum 

int valve1 = 0;
int valve2 = 0;
int valve3 = 0;
int valve4 = 0;

boolean resetFun=false;

int operation=0;
int readyToRead=2;//1=ready, 2=ready and testing communication

void setup() {
 // Serial.begin( 115200 );
  Serial1.begin( 115200 );
  //while (!Serial) {}
  //while (!Serial1) {}
  delay(1000);

  initializeLED();
  initializeValves();
  TMP75Initialize();
  MAX31865Initialize();
  //LUXInitialize();
  initializeLuxSF();
}

void loop() {
  checkCommunication();
  //pid();

 // unsigned long currentMillis = millis();
  if ((long)(millis()-oldMillisLoop)>=interval){
    oldMillisLoop=millis();
    TMP75Read();
    readPressure();
    readLuxSF();
    printReadAll();
    softReset();// check if communication has been succesful, else resert arduino
  }
}


// the restartWatchDog has to be constantly updated, else the arduino will restart, this ensures there is proper communication between the board and the Pi.
void softReset(){
 if ((long)(millis()-resetWatchDog)>=watchDogTimer){
  for (int i=0;i<100;i++){
    digitalWrite(ledPin, HIGH);   
    delay(30);                 
    digitalWrite(ledPin, LOW); 
    delay(30); 
    }
    soft_restart();
  }
}


