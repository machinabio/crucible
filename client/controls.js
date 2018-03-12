import '/imports/peripherals.js';
//import '/client/record.js';

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

  'click #v1-on'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v1_ON' } });
  },

  'click #v1-off'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v1_OFF' } });
  },

  'click #v2-on'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v2_ON' } });
  },

  'click #v2-off'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v2_OFF' } });
  },

  'click #v3-on'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v3_ON' } });
  },

  'click #v3-off'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v3_OFF' } });
  },

  'click #v4-on'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v4_ON' } });
  },

  'click #v4-off'() {
      Peripherals.update({ _id: 'chamber' }, { $set: { running: 'v4_OFF' } });
  }

/*
  'click #record_button'() {
      var c_n = startLog();
  },

  'submit #readings_to_file'(event, template) {
    var filename = template.find('#readings_to_file').value;
    endLog(filename, c_n);
  }*/
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

  v1_on_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v1_ON') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  },

  v1_off_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v1_OFF') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  },

  v2_on_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v2_ON') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  },

  v2_off_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v2_OFF') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  },

  v3_on_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v3_ON') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  },

  v3_off_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v3_OFF') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  },

  v4_on_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v4_ON') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  },

  v4_off_attributes() {
    var attributes
    if (Peripherals.findOne({_id : 'chamber'}).running == 'v4_OFF') {
      attributes = "ui inactive button"
    } else {
      attributes = "ui active button";
    }

    return {
      class:  attributes
    };
  }
/*
  record_button_attributes() {
    var attributes
    //SHOULD NOT BE CHAMBER AND PULL
    if (recording) {
      attributes = "ui inverted teal button"
    } else {
      attributes = "ui teal button";
    }

    return {
      class:  attributes
    };
  }*/

});
