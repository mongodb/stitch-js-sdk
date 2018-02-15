import * as base64 from 'Base64';

/**
 * @namespace util
 * @private
 */

/**
 * Utility method for executing a service action as a function call.
 *
 * @memberof util
 * @param {Object} service the service to execute the action on
 * @param {String} action the service action to execute
 * @param {Array} args the arguments to supply to the service action invocation
 * @returns {Promise} the API response from the executed service action
 */
function serviceResponse(service, { serviceName = service.serviceName, action, args }) {
  const { client } = service;

  if (!client) {
    throw new Error('Service has no client');
  }

  return client.executeServiceFunction(serviceName, action, args);
}

/**
 * Utility function to encode a JSON object into a valid string that can be
 * inserted in a URI. The object is first stringified, then encoded in base64,
 * and finally encoded via the builtin encodeURIComponent function.
 *
 * @memberof util
 * @param {Object} obj The object to encode
 * @returns {String} The encoded object
 */
function uriEncodeObject(obj) {
  return encodeURIComponent(base64.btoa(JSON.stringify(obj)));
}

export {
  serviceResponse,
  uriEncodeObject
};
