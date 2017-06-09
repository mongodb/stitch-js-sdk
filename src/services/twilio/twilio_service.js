import { serviceResponse, letMixin } from '../../util';

/**
 * Create a new TwilioService instance (not meant to be instantiated directly).
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
   * @return {Promise}
   */
  send(from, to, body) {
    return serviceResponse(this, {
      service: this.serviceName,
      action: 'send',
      args: { from, to, body }
    });
  }
}

export default letMixin(TwilioService);
