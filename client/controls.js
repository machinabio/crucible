import '/imports/peripherals.js';

Template.controls.events({
  'submit #thermolator_setpoint'(event , template) {
    var setpoint = template.find('#temp_setpoint').value;
    Peripherals.update({ _id: 'thermolator' }, { $set: { setpoint: setpoint } });
    event.preventDefault();
  },

  'submit #led_setpoint'(event , template) {
    var setpoint = template.find('#lux_setpoint').value;
    Peripherals.update({ _id: 'led' }, { $set: { setpoint: setpoint } });
    event.preventDefault();
  },

  'submit #chamber_setpoint'(event , template) {
    var setpoint = template.find('#pressure_setpoint').value;
    Peripherals.update({ _id: 'chamber' }, { $set: { setpoint: setpoint } });
    event.preventDefault();
  },

  'click #thermolator_run'() {
    Peripherals.update({ _id: 'thermolator' }, { $set: { running: true } });
  },

  'click #thermolator_stop'() {
    Peripherals.update({ _id: 'thermolator' }, { $set: { running: false } });
  },

  'click #chamber_run'() {
    Peripherals.update({ _id: 'chamber' }, { $set: { running: 'run' } });
  },

  'click #chamber_vent'() {
    Peripherals.update({ _id: 'chamber' }, { $set: { running: 'vent' } });
  },

  'click #chamber_hold'() {
    Peripherals.update({ _id: 'chamber' }, { $set: { running: 'hold' } });
  },

  'click #chamber_pull'() {
    Peripherals.update({ _id: 'chamber' }, { $set: { running: 'pull' } });
  },

  'click #chamber_pull'() {
    Peripherals.update({ _id: 'chamber' }, { $set: { running: 'pull' } });
  },

  'click #download_button'() {
    import './.meteor/local/build/programs/server/reads.csv' as csv;
    if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
    let data = encodeURI(csv);
    let link = document.createElement('a');
    let filename = {_id : 'readings_to_file'} || 'export.csv'
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();


    //SOURCE:
    /*function handleFiles(files) {
      // Check for the various File API support.
      if (window.FileReader) {
          // FileReader are supported.
          getAsText(files[0]);
      } else {
          alert('FileReader are not supported in this browser.');
      }
    }

    function getAsText(fileToRead) {
      var reader = new FileReader();
      // Read file into memory as UTF-8
      reader.readAsText(fileToRead);
      // Handle errors load
      reader.onload = loadHandler;
      reader.onerror = errorHandler;
    }

    function loadHandler(event) {
      var csv = event.target.result;
      processData(csv);
    }

    function processData(csv) {
        var allTextLines = csv.split(/\r\n|\n/);
        var lines = [];
        for (var i=0; i<allTextLines.length; i++) {
            var data = allTextLines[i].split(';');
                var tarr = [];
                for (var j=0; j<data.length; j++) {
                    tarr.push(data[j]);
                }
                lines.push(tarr);
        }
      console.log(lines);
    }

    function errorHandler(evt) {
      if(evt.target.error.name == "NotReadableError") {
          alert("Canno't read file !");
      }
    }*/
  },
});

Template.controls.helpers({
  thermolator() {
    return Peripherals.findOne({_id : 'thermolator'});
  },

  led() {
    return Peripherals.findOne({_id : 'led'});
  },

  chamber() {
    return Peripherals.findOne({_id : 'chamber'});
  },

  stop_attributes() {
    var state = Peripherals.findOne({_id : 'thermolator'}).running;
    return {
      class:  state ? 'ui inverted red button' : 'ui red button'
    };
  },

  run_attributes() {
    var state = Peripherals.findOne({_id : 'thermolator'}).running;
    return {
      class:  state ? 'ui green button' : 'ui inverted green button'
    };
  },

  chamber_run_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'run') {
      attributes = "ui green button"
    } else {
      attributes = "ui inverted green button";
    }
    return {
      class:  attributes
    };
  },

  chamber_vent_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'vent') {
      attributes = "ui teal button"
    } else {
      attributes = "ui inverted teal button";
    }
    return {
      class:  attributes
    };
  },

  chamber_hold_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'hold') {
      attributes = "ui red button"
    } else {
      attributes = "ui inverted red button";
    }

    return {
      class:  attributes
    };
  },

  chamber_pull_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'pull') {
      attributes = "ui green button"
    } else {
      attributes = "ui inverted green button";
    }

    return {
      class:  attributes
    };
  },

  download_button_attributes() {
    var attributes
    //SHOULD NOT BE CHAMBER AND PULL
    attributes = "ui teal button";

    return {
      class:  attributes
    };
  },

});
