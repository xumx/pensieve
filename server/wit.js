var wit = Meteor.npmRequire('node-wit');
var ACCESS_TOKEN = 'VZJL66BPLO7VYY7THKLZEYPUTPPRQFEG';

var captureTextIntent = Async.wrap(wit, 'captureTextIntent');


Meteor.methods({
    getIntent: function (intent) {
        var result = captureTextIntent(ACCESS_TOKEN, intent);
        return result;
    }
});