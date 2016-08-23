# Crucible Arduino Meteor Integration 

Meteor to Raspberry Pi to Arduino Integration 

Install

meteor npm install
meteor --settings.json

Settings
The json file should have:

```
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
	}
}
```

The thermolator model can be either `thermoscientific` or `julabo`

The debug setting turns allows running crucible without a pi.

