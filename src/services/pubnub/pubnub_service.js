import { serviceResponse, letMixin } from '../../util';

/**
 * Convenience wrapper around Pubnub API (not meant to be instantiated directly).
 *
 * @class
 * @return {PubnubService} a PubnubService instance.
 */
class PubnubService {
  constructor(stitchClient, serviceName) {
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
  publish(channel, message) {
    return serviceResponse(this, {
      service: this.serviceName,
      action: 'publish',
      args: { channel, message }
    });
  }
}

export default letMixin(PubnubService);
