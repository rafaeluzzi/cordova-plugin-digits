const exec = require('cordova/exec');

function noop() {}

const digits = {
  authenticate: function authenticate(options, authenticateSuccess, authenticateFailed) {
    exec(function success(result) {
      (authenticateSuccess || noop)(JSON.parse(result));
    }, authenticateFailed || noop, 'Digits', 'authenticate', [ options ]);
  },
};

module.exports = digits;
