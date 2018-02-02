Plotly.d3.csv("https://raw.githubusercontent.com/miamirkovic/crucible/master/crucibledata.csv", function(rows){
	function unpack(rows, key) {
   return rows.map(function(row) { return row[key]; });
  }

  //PRESSURE
    var pressure = {
      type: 'scatter',
      mode: 'lines',
		name: "Pressure (kPa)",
      x: unpack(rows, "ts"),
      y: unpack(rows, "pressure")

	 };

	var pressureSetPoint = {
    	 type: "scatter",
    	 mode: 'lines',
		 name: 'Pressure Set Point (kPa)',
   	 x: unpack(rows, "ts"),
   	 y: unpack(rows, "pressureSetPoint"),

    };

	var pressureData = [pressure, pressureSetPoint]

   var pressureLayout = {
		title: "Pressure",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Pressure (kPa)"}
    };

	//VALVES
	var valve1 = {
    type: "scatter",
	 mode: 'lines+markers',
	 name: 'Valve 1',
    line: {shape: "hv"},
    x: unpack(rows, "ts"),
    y: unpack(rows, "valve1")
  };

  var valve2 = {
	 type: "scatter",
	 mode: 'lines+markers',
	 name: 'Valve 2',
    line: {shape: "hv"},
    x: unpack(rows, "ts"),
    y: unpack(rows, "valve2"),
  };

  var valve3 = {
    type: "scatter",
	 mode: 'lines+markers',
	 name: 'Valve 3',
    line: {shape: "hv"},
	 x: unpack(rows, "ts"),
    y: unpack(rows, "valve3")
  };

  var valve4 = {
	 type: "scatter",
	 mode: 'lines+markers',
    name: 'Valve 4',
    line: {shape: "hv"},
    x: unpack(rows, "ts"),
    y: unpack(rows, "valve4")
  };

	var valveData = [valve1, valve2, valve3, valve4];

	var valveLayout = {
		title: "Valves",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Valve Status"}
    };

	//BOARD
	var boardTemp = {
		type: "scatter",
		mode: "lines",
		name: "Board Temperature (°C)",
		x: unpack(rows, "ts"),
		y: unpack(rows, "boardTemp")
	}

	var boardLayout = {
		title: "Board Temperature",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Board Temperature (°C)"}
	}

	//CHAMBER
	var chamberTemp = {
		type: "scatter",
		mode: "lines",
		name: "Chamber Temperature (°C)",
		x: unpack(rows, "ts"),
		y: unpack(rows, "chamberTemp")
	}

	var chamberTempLayout = {
		title: "Chamber Temperature",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Chamber Temperature (°C)"}
	}

	var chamberState = {
		type: "scatter",
	 	mode: 'lines+markers',
    	name: 'Chamber State',
    	line: {shape: "hv"},
    	x: unpack(rows, "ts"),
    	y: unpack(rows, "chamberState")
	}

	var chamberStateLayout = {
		title: "Chamber State",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Chamber State"}
	}

	//THERMOLATOR
	var thermTemp = {
		type: "scatter",
		mode: "lines",
		name: "Thermolator Temperature (°C)",
		x: unpack(rows, "ts"),
		y: unpack(rows, "thermTemp")
	}

	var thermSetPoint = {
		type: "scatter",
		mode: "lines",
		name: "Thermolator Set Point (°C)",
		x: unpack(rows, "ts"),
		y: unpack(rows, "thermSetPoint")
	}

	var thermTempData = [thermTemp, thermSetPoint];

	var thermTempLayout = {
		title: "Thermolator Temperature",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Thermolator Temperature (°C)"}
	}

	var thermState = {
      type: "scatter",
	 	mode: 'lines+markers',
    	name: 'Thermolator State',
    	line: {shape: "hv"},
    	x: unpack(rows, "ts"),
    	y: unpack(rows, "thermState")
	}

		var thermStateLayout = {
		title: "Thermolator State",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Thermolator State"}
	}

	//LED
	var LEDBrightness = {
		type: "scatter",
		mode: "lines",
		name: "LED Brightness (lm)",
		x: unpack(rows, "ts"),
		y: unpack(rows, "LEDBrightness")
	}

	var LEDSetPoint = {
		type: "scatter",
		mode: "lines",
		name: "LED Set Point (lm)",
		x: unpack(rows, "ts"),
		y: unpack(rows, "LEDSetPoint")
	}

	var LEDBrightnessData = [LEDBrightness, LEDSetPoint];

	var LEDBrightnessLayout = {
		title: "LED Brightness",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "LED Brightness (lm)"}
	}

	var LEDDutyCycle = {
      type: "scatter",
	 	mode: 'lines+markers',
    	name: 'LED Duty Cycle',
    	line: {shape: "hv"},
    	x: unpack(rows, "ts"),
    	y: unpack(rows, "LEDDutyCycle")
	}

		var LEDDutyCycleLayout = {
		title: "LED Duty Cycle",
      xaxis: {title: "Time (s)"},
      yaxis: {title: "Cycle"}
	}

	//PLOTS
	//Pressure Plot
	Plotly.plot(document.getElementById('pressure'), pressureData, pressureLayout, {showLink: false});

	//Valve Plot
	Plotly.plot(document.getElementById('valves'), valveData, valveLayout, {showLink: false});

	//Board Temp Plot
	Plotly.plot(document.getElementById('board temp'), [boardTemp], boardLayout, {showLink: false});

	//Chamber Plots
	Plotly.plot(document.getElementById('chamber temp'), [chamberTemp], chamberTempLayout, {showLink: false});

	Plotly.plot(document.getElementById('chamber state'), [chamberState], chamberStateLayout, {showLink: false});

	//Therm Plots
	Plotly.plot(document.getElementById('therm temp'), thermTempData, thermTempLayout, {showLink: false});

	Plotly.plot(document.getElementById('therm state'), [thermState], thermStateLayout, {showLink: false});

	//LED Plots
	Plotly.plot(document.getElementById('LED brightness'), LEDBrightnessData, LEDBrightnessLayout, {showLink: false});

	Plotly.plot(document.getElementById('LED duty cycle'), [LEDDutyCycle], LEDDutyCycleLayout, {showLink: false});

});
