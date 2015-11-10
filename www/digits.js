const exec = require('cordova/exec');

function noop() {}

const digits = {
  authenticate: function authenticate(authenticateSuccess, authenticateFailed) {
    exec(function success(result) {
      (authenticateSuccess || noop)(JSON.parse(result));
    }, authenticateFailed || noop, 'Digits', 'authenticate', []);
  },
};

module.exports = digits;
