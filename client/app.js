//Client side
Messages = new Mongo.Collection('messages');

var test="this works";
var luxSet, pressSet, tempSet, v1, v2, v3, v4,todo;
var oldLuxSet, oldPressSet, oldTempSet, oldV1, oldV2, oldV3, oldV4;
var running=false;



Template.main.helpers({
  lightStateClass: function() {
     return Template.instance().defaultLight().state ? 'success' : 'danger';
  },
  messages: function() {
    return Messages.find({}, {
      sort: {
        created: -1
      }
    });
  },
  isMessageType: function(messageType) {
    return this.messageType === messageType;
  }
});

Template.main.events({
   'click #clearMessages': function(e, t) {
    e.preventDefault();
    var messages = Messages.find().fetch();
    messages.forEach(function(message) {
      Meteor.call('removeMessage', message._id);
    });
  },

  'click #sendThermoCoommand': function(e, t) {
    e.preventDefault();
    var textThermo=$('#textThermo').val();
    Meteor.call('textThermo', textThermo);
  },

  'click #runThermo': function(e, t) {
    e.preventDefault();
    var running = Peripherals.findOne({_id: 'thermolator'}).running;
    Peripherals.upsert({_id: 'thermolator'}, { $set : {running: !running}});
  },

  'change #newTempSet': function(e, t) {
    var setpoint=$('#newTempSet').val();
    Peripherals.upsert({_id: 'thermolator'}, { $set : {setpoint: setpoint}});
  },

  'change #newLuxSet' : function(e, t) {
    var setpoint=$('#newLuxSet').val();
    Peripherals.upsert({_id: 'led'}, { $set : {setpoint: setpoint}});
  },

  'change #newPresSet' : function(e, t) {
    var setpoint=$('#newPresSet').val();
    Peripherals.upsert({_id: 'chamber'}, { $set : {setpoint: setpoint}});
  },

  'change #valve1Status' : function(e, t) {
    var state=$('#newPresSet').val();
    Peripherals.upsert({_id: 'pressure'}, { $set : {vent: state}});
  },

  // 'click #setValues' : function(e, t) {
  //   e.preventDefault();
  //   var v1,v2,v3,v4;
  //   var pressSet=$('#newPresSet').val();
  //   var luxSet=$('#newLuxSet').val();
  //   var tempSet=$('#newTempSet').val();
  //   var todo=0;
  //   if ($('#valve1Status').prop('checked')) 
  //     {v1=1;}
  //   else
  //     { v1=0; }
  //   if ($('#valve2Status').prop('checked')) 
  //     { v2=1; }
  //   else
  //     { v2=0; }
  //   if ($('#valve3Status').prop('checked'))
  //     { v3=1; }
  //   else
  //     { v3=0; }
  //   if ($('#valve4Status').prop('checked'))
  //     { v4=1; }
  //   else
  //     { v4=0; }

  //   Meteor.call('toServer', tempSet,luxSet,pressSet,v1,todo);
  // },
});


Template.main.onCreated(function() {
  var self = this;
  console.log(test);
  var defaultLight = Lights.find({pin: 13});
  self.subscribe('lights');
  self.defaultLight = function() {
    return defaultLight && defaultLight.fetch()[0];
  }

  defaultLight.observe({
    changed: function(newDoc, oldDoc) {
      var tmpDoc = newDoc;
      tmpDoc.created = new Date();
      tmpDoc.messageType = 'pinChange';
      delete tmpDoc._id;
      Meteor.call('message', tmpDoc);
    }
  });
  self.subscribe('messages');
});
