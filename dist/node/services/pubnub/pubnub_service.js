'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Convenience wrapper around Pubnub API (not meant to be instantiated directly).
 *
 * @class
 * @return {PubnubService} a PubnubService instance.
 */
var PubnubService = function () {
  function PubnubService(stitchClient, serviceName) {
    _classCallCheck(this, PubnubService);

    this.client = stitchClient;
    this.serviceName = serviceName;
  }

  /**
   * Publish a message to a channel
   *
   * @method
   * @param {String} channel the channel to publish to
   * @param {String} message the message to publish
   * @return {Promise}
   */


  _createClass(PubnubService, [{
    key: 'publish',
    value: function publish(channel, message) {
      return (0, _util.serviceResponse)(this, {
        service: this.serviceName,
        action: 'publish',
        args: { channel: channel, message: message }
      });
    }
  }]);

  return PubnubService;
}();

exports.default = (0, _util.letMixin)(PubnubService);