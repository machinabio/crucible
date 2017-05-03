# Crucible Arduino Meteor Integration 

Meteor to Raspberry Pi to Arduino Integration 

## Running
You'll have to install Meteor to run this app. Do not upgrade the Meteor version requested by this app because it Meteor 1.3.4 is the more recent version to run on a Pi.

```bash
git clone https://github.com/luzlab/crucible.git
cd crucible
meteor npm install
meteor --settings settings.json
```

## Settings
The json file should have:


```json
{
  "data360": {
    ...
  } ,
  "arduino": {
    "baudrate" : "XX",
    "port" :"/dev/XX"
  },
  "thermolator": {
    "baudrate" : "XX",
    "port" :"/dev/XX",
    "model" : "XX" 
  },
  "logging": false
}
```

The thermolator model can be either `thermoscientific` or `julabo`.
The logging setting controls whether the serial methods should be logged to the console.

## Development
Starting the app with NODE_ENV set to development allows development in the absence of a Pi or any serial ports.

```bash
NODE_ENV=development meteor --settings settings.json
```

#Note: branch shuffle: master > legacy, drew-refactor>master
