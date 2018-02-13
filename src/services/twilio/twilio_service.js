import { serviceResponse } from '../../util';

/**
 * Create a new TwilioService instance (not meant to be instantiated directly,
 * use `.service('twilio', '<service-name>')` on a {@link StitchClient} instance).
 *
 * @class
 * @return {TwilioService} a TwilioService instance.
 */
class TwilioService {
  constructor(stitchClient, serviceName) {
    this.client = stitchClient;
    this.serviceName = serviceName;
  }

  /**
   * Send a text message to a number
   *
   * @method
   * @param {String} from number to send from
   * @param {String} to number to send to
   * @param {String} body SMS body content
   * @return {Promise} which resolves to 'null' when message is sent successfully,
   *                   or is rejected when there is an error
   */
  send(from, to, body) {
    return serviceResponse(this, {
      action: 'send',
      args: { from, to, body }
    });
  }
}

export default TwilioService;
