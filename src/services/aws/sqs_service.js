/**
 * Convenience wrapper for AWS SQS (not meant to be instantiated directly).
 *
 * @class
 * @return {SQSService} a SQSService instance.
 */
class SQSService {
  constructor(baasClient, serviceName) {
    this.client = client;
    this.serviceName = serviceName;
  }

  /**
   * Send a message of the output of previous stage to queue
   *
   * @return {Promise}
   */
  send() {
    return this.client.executePipeline([
      {
        service: this.serviceName,
        action: 'send'
      }
    ]);
  }

  /**
   * Receive a message from queue
   *
   * @return {Promise}
   */
  receive() {
    return this.client.executePipeline([
      {
        service: this.serviceName,
        action: 'receive'
      }
    ]);
  }

}

export default SQSService;
