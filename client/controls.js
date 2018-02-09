import '/imports/peripherals.js';
import '/imports/papaparse/papa-parse';
import logReads from '/imports/log-csv.js';

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
    Peripherals.update({ _id: 'chamber' }, { $set: { running: 'pull_vac' } });
  },

  'click #chamber_gas'() {
    Peripherals.update({ _id: 'chamber' }, { $set: { running: 'pull_gas' } });
  },

  'submit #readings_to_file'(event, template) {
    var filename = template.find('#readings_to_file').value || 'reads.csv';

    var writer = csvWriter({
      sendHeaders: true,
    });

    writer.pipe(fs.createWriteStream(filename, {flags: 'a'}));

    process.on('exit', function () {
      writer.end();

    });
    Meteor.setInterval(logReads, FREQ);

  },

  'click #download_button'() {
    //SOURCE: https://github.com/mholt/PapaParse/issues/175
    var blob = new Blob([filename]);
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
    a.download = filename;
    document.body.appendChild(a);
    a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a);

  }
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
      class:  state ? 'ui red button' : 'ui inverted red button'
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
      attributes = "ui inverted red button"
    } else {
      attributes = "ui red button";
    }

    return {
      class:  attributes
    };
  },

  chamber_pull_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'pull_vac') {
      attributes = "ui green button"
    } else {
      attributes = "ui inverted green button";
    }

    return {
      class:  attributes
    };
  },

  chamber_gas_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'pull_gas') {
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
  }

});
