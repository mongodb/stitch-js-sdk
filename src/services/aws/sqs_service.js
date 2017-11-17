import { serviceResponse } from '../../util';

/**
 * Convenience wrapper for AWS SQS (not meant to be instantiated directly).
 *
 * @class
 * @return {SQSService} a SQSService instance.
 */
class SQSService {
  constructor(client, serviceName) {
    this.client = client;
    this.serviceName = serviceName;
  }

  /**
   * Send a message of the output of previous stage to queue
   *
   * @return {Promise}
   */
  send() {
    return serviceResponse(this, { action: 'send' });
  }

  /**
   * Receive a message from queue
   *
   * @return {Promise}
   */
  receive() {
    return serviceResponse(this, { action: 'receive' });
  }
}

export default SQSService;
