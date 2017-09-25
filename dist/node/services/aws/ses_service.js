'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Convenience wrapper around AWS SES service (not meant to be instantiated directly).
 *
 * @class
 * @return {SESService} a SESService instance.
 */
var SESService = function () {
  function SESService(stitchClient, serviceName) {
    _classCallCheck(this, SESService);

    this.client = stitchClient;
    this.serviceName = serviceName;
  }

  /**
   * Send an email
   *
   * @method
   * @param {String} from the email to send from
   * @param {String} to the email to send to
   * @param {String} subject the subject of the email
   * @param {String} body the body of the email
   * @return {Promise}
   */


  _createClass(SESService, [{
    key: 'send',
    value: function send(from, to, subject, body) {
      return (0, _util.serviceResponse)(this, {
        service: this.serviceName,
        action: 'send',
        args: { from: from, to: to, subject: subject, body: body }
      });
    }
  }]);

  return SESService;
}();

exports.default = (0, _util.letMixin)(SESService);