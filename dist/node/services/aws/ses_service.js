'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Convenience wrapper around AWS SES service (not meant to be instantiated directly,
 * use `.service('aws-ses', '<service-name>')` on a {@link StitchClient} instance).
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
   * @param {String} fromAddress the email to send from
   * @param {String} toAddress the email to send to
   * @param {String} subject the subject of the email
   * @param {String} body the body of the email
   * @return {Promise} resolving to an object which contains the single string field
   *                   "messageId", which is the SES message ID for the email message.
   */


  _createClass(SESService, [{
    key: 'send',
    value: function send(fromAddress, toAddress, subject, body) {
      return (0, _util.serviceResponse)(this, {
        action: 'send',
        args: { fromAddress: fromAddress, toAddress: toAddress, subject: subject, body: body }
      });
    }
  }]);

  return SESService;
}();

exports.default = SESService;
module.exports = exports['default'];