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
  }

});
