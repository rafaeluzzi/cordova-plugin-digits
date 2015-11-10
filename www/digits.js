const exec = require('cordova/exec');

function noop() {}

const digits = {
  authenticate: function authenticate(successCallback, failureCallback) {
    exec(successCallback || noop, failureCallback || noop, 'Digits', 'authenticate', []);
  },
};

module.exports = digits;
