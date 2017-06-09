import { serviceResponse, letMixin } from '../../util';

/**
 * Convenience wrapper around Slack API (not meant to be instantiated directly).
 *
 * @class
 * @return {SlackService} a SlackService instance.
 */
class SlackService {
  constructor(stitchClient, serviceName) {
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
  post(channel, text, options = {}) {
    let args = { channel, text };
    if (!!options.username) args.username = options.username;
    if (!!options.iconUrl) args.iconUrl = options.iconUrl;
    if (!!options.iconEmoji) args.iconEmoji = options.iconEmoji;
    if (!!options.attachments) args.attachments = options.attachments;

    return serviceResponse(this, {
      service: this.serviceName,
      action: 'publish',
      args: args
    });
  }
}

export default letMixin(SlackService);
