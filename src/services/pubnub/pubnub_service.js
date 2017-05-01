/**
 * Convenience wrapper around Pubnub API (not meant to be instantiated directly).
 *
 * @class
 * @return {PubnubService} a PubnubService instance.
 */
class PubnubService {
  constructor(baasClient, serviceName) {
    this.client = baasClient;
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
  publish(channel, message) {
    return this.client.executePipeline([
      {
        service: this.serviceName,
        action: 'publish',
        args: { channel, message }
      }
    ]);
  }
}

export default PubnubService;
