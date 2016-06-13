/**************************************************************************
 * MAX31865 Basic Example
 *
 * Copyright (C) 2015 Ole Wolf <wolf@blazingangles.com>
 *
 *
 * Example code that reads the temperature from an MAX31865 and outputs
 * it on the serial line.
 * 
 * Wire the circuit as follows, assuming that level converters have been
 * added for the 3.3V signals:
 *
 *    Arduino Uno   -->  MAX31865
 *    ---------------------------
 *    CS: pin 10    -->  CS
 *    MOSI: pin 11  -->  SDI (must not be changed for hardware SPI)
 *    MISO: pin 12  -->  SDO (must not be changed for hardware SPI)
 *    SCK: pin 13   -->  SCLK (must not be changed for hardware SPI)
 *    
 *    Arduino Micro
 *    CS:   pin SS
 *    MOSI: pin MO
 *    MISO: pin MI
 *    SCK:  pin SCK
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>. 
 **************************************************************************/


void MAX31865Initialize(){
/* Initialize SPI communication. */
  SPI.begin( );
  SPI.setClockDivider( SPI_CLOCK_DIV16 );
  SPI.setDataMode( SPI_MODE3 );

  /* Allow the MAX31865 to warm up. */
  //delay( 1000 );
  //Serial.println(" Initializing MAX31865");
  rtd.configure( true, true, false, true, MAX31865_FAULT_DETECTION_NONE, true, true, 0x0000, 0x7fff );
}


void MAX31865ReadTemp() 
{
  rtd.read_all( );

  if( rtd.status( ) == 0 )
  {
    double temperature = rtd.temperature( );
    //Serial.print( " T = ");
    //Serial.print( temperature, 1 );
    //Serial.println(" deg C" );
   // Serial.println("");
  }
  else 
  {
    //Serial.print( "RTD fault register: " );
    //Serial.print( rtd.status( ) );
    //Serial.print( ": " );
    if( rtd.status( ) & MAX31865_FAULT_HIGH_THRESHOLD )
    {
      //Serial.println( "RTD high threshold exceeded" );
    }
    else if( rtd.status( ) & MAX31865_FAULT_LOW_THRESHOLD )
    {
      //Serial.println( "RTD low threshold exceeded" );
    }
    else if( rtd.status( ) & MAX31865_FAULT_REFIN )
    {
      //Serial.println( "REFIN- > 0.85 x V_BIAS" );
    }
    else if( rtd.status( ) & MAX31865_FAULT_REFIN_FORCE )
    {
      //Serial.println( "REFIN- < 0.85 x V_BIAS, FORCE- open" );
    }
    else if( rtd.status( ) & MAX31865_FAULT_RTDIN_FORCE )
    {
      //Serial.println( "RTDIN- < 0.85 x V_BIAS, FORCE- open" );
    }
    else if( rtd.status( ) & MAX31865_FAULT_VOLTAGE )
    {
      //Serial.println( "Overvoltage/undervoltage fault");
    }
    else
    {
      //Serial.println( "Unknown fault; check connection" );
    }
  }

  //delay( 3000 );
}

