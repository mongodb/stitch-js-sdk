'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Convenience wrapper around Slack API (not meant to be instantiated directly).
 *
 * @class
 * @return {SlackService} a SlackService instance.
 */
var SlackService = function () {
  function SlackService(stitchClient, serviceName) {
    _classCallCheck(this, SlackService);

    this.client = stitchClient;
    this.serviceName = serviceName;
  }

  /**
   * Post a message to a channel
   *
   * @method
   * @param {String} channel the channel to post to
   * @param {String} text the text to post
   * @param {Object} [options]
   * @param {String} [options.username] the username to post as
   * @param {String} [options.iconUrl] url to icon of user
   * @param {String} [options.iconEmoji] an icon
   * @param {String[]} [options.attachments] a list of attachments for the message
   * @return {Promise}
   */


  _createClass(SlackService, [{
    key: 'post',
    value: function post(channel, text) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var args = { channel: channel, text: text };
      if (!!options.username) args.username = options.username;
      if (!!options.iconUrl) args.iconUrl = options.iconUrl;
      if (!!options.iconEmoji) args.iconEmoji = options.iconEmoji;
      if (!!options.attachments) args.attachments = options.attachments;

      return (0, _util.serviceResponse)(this, {
        service: this.serviceName,
        action: 'publish',
        args: args
      });
    }
  }]);

  return SlackService;
}();

exports.default = (0, _util.letMixin)(SlackService);