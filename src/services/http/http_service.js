import { serviceResponse } from '../../util';

/**
 * Convenience wrapper for HTTP service (not meant to be instantiated directly,
 * use `.service('http', '<service-name>')` on a {@link StitchClient} instance).
 *
 * @class
 * @return {HTTPService} a HTTPService instance.
 */
class HTTPService {
  constructor(client, serviceName) {
    this.client = client;
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
    return buildResponse('get', this, buildArgs(urlOrOptions, options));
  }

  /**
   * Send a POST request to a resource with payload
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of POST args
   * @param {Object} [options] optional settings for the POST operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  post(urlOrOptions, options = {}) {
    return buildResponse('post', this, buildArgs(urlOrOptions, options));
  }

  /**
   * Send a PUT request to a resource with payload
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of PUT args
   * @param {Object} [options] optional settings for the PUT operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  put(urlOrOptions, options = {}) {
    return buildResponse('put', this, buildArgs(urlOrOptions, options));
  }

  /**
   * Send a PATCH request to a resource with payload
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of PATCH args
   * @param {Object} [options] optional settings for the PATCH operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  patch(urlOrOptions, options = {}) {
    return buildResponse('patch', this, buildArgs(urlOrOptions, options));
  }

  /**
   * Send a DELETE request to a resource
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of DELETE args
   * @param {Object} [options] optional settings for the DELETE operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  delete(urlOrOptions, options = {}) {
    return buildResponse('delete', this, buildArgs(urlOrOptions, options));
  }

  /**
   * Send a HEAD request to a resource
   *
   * @param {String|Object} urlOrOptions the url to request, or an object of HEAD args
   * @param {Object} [options] optional settings for the HEAD operation
   * @param {String} [options.authUrl] url that grants a cookie
   * @return {Promise}
   */
  head(urlOrOptions, options = {}) {
    return buildResponse('head', this, buildArgs(urlOrOptions, options));
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

function buildResponse(action, service, args) {
  return serviceResponse(service, {
    action,
    args
  });
}

export default HTTPService;
