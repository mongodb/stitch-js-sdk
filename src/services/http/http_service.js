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
   * @param {String|Object} urlOrOptions the url to request, or an object of GET args
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  get(urlOrOptions, options = {}) {
    let args = buildArgs(urlOrOptions, options);
    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'get',
      args: args
    });
  }

  /**
   * Send a POST request to a resource with payload from previous stage
   *
   * NOTE: item from previous stage must serializable to application/json
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of POST args
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  post(urlOrOptions, options = {}) {
    let args = buildArgs(urlOrOptions, options);
    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'post',
      args: args
    });
  }

  /**
   * Send a PUT request to a resource with payload from previous stage
   *
   * NOTE: item from previous stage must serializable to application/json
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of POST args
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  put(urlOrOptions, options = {}) {
    let args = buildArgs(urlOrOptions, options);
    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'put',
      args: args
    });
  }

  /**
   * Send a PATCH request to a resource with payload from previous stage
   *
   * NOTE: item from previous stage must serializable to application/json
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of POST args
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  patch(urlOrOptions, options = {}) {
    let args = buildArgs(urlOrOptions, options);
    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'patch',
      args: args
    });
  }

  /**
   * Send a DELETE request to a resource
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of POST args
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  delete(urlOrOptions, options = {}) {
    let args = buildArgs(urlOrOptions, options);
    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'delete',
      args: args
    });
  }

  /**
   * Send a HEAD request to a resource
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of POST args
   * @param {Object} [options] optional settings for the GET operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  head(urlOrOptions, options = {}) {
    let args = buildArgs(urlOrOptions, options);
    return serviceResponse(this.client, {
      service: this.serviceName,
      action: 'head',
      args: args
    });
  }
}

function buildArgs(urlOrOptions, options) {
  let args;
  if (typeof urlOrOptions !== 'string') {
    args = urlOrOptions;
  } else {
    args = { url: urlOrOptions };
    if (!!options.authUrl) args.authUrl = options.authUrl;
  }

  return args;
}

export default HTTPService;
