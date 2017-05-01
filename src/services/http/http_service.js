import { serviceResponse } from '../../util';

/**
 * Convenience wrapper for HTTP service (not meant to be instantiated directly).
 *
 * @class
 * @return {HTTPService} a HTTPService instance.
 */
class HTTPService {
  constructor(baasClient, serviceName) {
    this.client = baasClient;
    this.serviceName = serviceName;
  }

  /**
   * Send a GET request to a resource (result must be application/json)
   *
   * @param {String} url the url to request
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  get(url, options = {}) {
    const args = { url };
    if (!!options.authUrl) args.authUrl = options.authUrl;

    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'get',
      args: args
    });
  }

  /**
   * Send a POST to a resource with payload from previous stage
   *
   * NOTE: item from previous stage must serializable to application/json
   *
   * @param {String} url the url to request
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  post(url, options = {}) {
    let args = { url };
    if (!!options.authUrl) args.authUrl = options.authUrl;

    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'post',
      args: args
    });
  }
}

export default HTTPService;
