/**
 * Convenience wrapper around Slack API (not meant to be instantiated directly).
 *
 * @class
 * @return {SlackService} a SlackService instance.
 */
class SlackService {
  constructor(baasClient, serviceName) {
    this.client = baasClient;
    this.serviceName = serviceName;
  }

  /**
   * Post a message to a channel
   *
   * @method
   * @param {String} channel the channel to post to
   * @param {String} message the message to post
   * @param {Object} [options]
   * @param {String} [options.username] the username to post as
   * @param {String} [options.iconUrl] url to icon of user
   * @param {String} [options.iconEmoji] an icon
   * @param {String[]} [options.attachments] a list of attachments for the message
   * @return {Promise}
   */
  post(channel, message, options = {}) {
    let args = { channel, message };
    if (!!options.username) args.username = options.username;
    if (!!options.iconUrl) args.iconUrl = options.iconUrl;
    if (!!options.iconEmoji) args.iconEmoji = options.iconEmoji;
    if (!!options.attachments) args.attachments = options.attachments;

    return this.client.executePipeline([
      {
        service: this.serviceName,
        action: 'publish',
        args: args
      }
    ]);
  }
}

export default SlackService;
