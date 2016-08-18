import '/imports/peripherals.js';

Template.controls.events(
  {
    'submit form' : function(event , template) {
      var setPoint = template.find('#setPoint').value;
      Peripherals.update({ _id: 'thermolator' }, { $set: { setpoint: setPoint } });
      event.preventDefault();
    }
  });

Template.controls.currentTemp = function () {
    return Peripherals.findOne({_id : 'thermolator'}).temperature;
  };

Template.controls.setPoint = function () {
    return Peripherals.findOne({_id : 'thermolator'}).setpoint;
  };
