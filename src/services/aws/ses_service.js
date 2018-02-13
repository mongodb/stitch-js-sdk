import { serviceResponse } from '../../util';

/**
 * Convenience wrapper around AWS SES service (not meant to be instantiated directly,
 * use `.service('aws-ses', '<service-name>')` on a {@link StitchClient} instance).
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
   * @param {String} fromAddress the email to send from
   * @param {String} toAddress the email to send to
   * @param {String} subject the subject of the email
   * @param {String} body the body of the email
   * @return {Promise} resolving to an object which contains the single string field
   *                   "messageId", which is the SES message ID for the email message.
   */
  send(fromAddress, toAddress, subject, body) {
    return serviceResponse(this, {
      action: 'send',
      args: { fromAddress, toAddress, subject, body }
    });
  }
}

export default SESService;
