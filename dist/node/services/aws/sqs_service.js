'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Convenience wrapper for AWS SQS (not meant to be instantiated directly).
 *
 * @class
 * @return {SQSService} a SQSService instance.
 */
var SQSService = function () {
  function SQSService(client, serviceName) {
    _classCallCheck(this, SQSService);

    this.client = client;
    this.serviceName = serviceName;
  }

  /**
   * Send a message of the output of previous stage to queue
   *
   * @return {Promise}
   */


  _createClass(SQSService, [{
    key: 'send',
    value: function send() {
      return (0, _util.serviceResponse)(this, {
        service: this.serviceName,
        action: 'send'
      });
    }

    /**
     * Receive a message from queue
     *
     * @return {Promise}
     */

  }, {
    key: 'receive',
    value: function receive() {
      return (0, _util.serviceResponse)(this, {
        service: this.serviceName,
        action: 'receive'
      });
    }
  }]);

  return SQSService;
}();

exports.default = (0, _util.letMixin)(SQSService);