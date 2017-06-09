import { serviceResponse, letMixin } from '../../util';

/**
 * Convenience wrapper around AWS SES service (not meant to be instantiated directly).
 *
 * @class
 * @return {SESService} a SESService instance.
 */
class SESService {
  constructor(stitchClient, serviceName) {
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
  send(from, to, subject, body) {
    return serviceResponse(this, {
      service: this.serviceName,
      action: 'send',
      args: { from, to, subject, body }
    });
  }
}

export default letMixin(SESService);
