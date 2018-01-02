import * as base64 from 'Base64';

const RESULT_METADATA_KEY = '_stitch_metadata';

/** @namespace util */

/**
 * Utility which creates a function that extracts metadata
 * from the server in the response to a pipeline request,
 * and attaches it to the final result after the finalizer has been applied.
 *
 * @memberof util
 * @param {Function} [func] optional finalizer to transform the response data
 */
export const collectMetadata = (func) => {
  const attachMetadata = metadata => (res) => {
    if (typeof res === 'object' && !Object.prototype.hasOwnProperty.call(res, RESULT_METADATA_KEY)) {
      Object.defineProperty(
        res,
        RESULT_METADATA_KEY,
        {enumerable: false, configurable: false, writable: false, value: metadata}
      );
    }
    return Promise.resolve(res);
  };
  const captureMetadata = (data) => {
    let metadata = {};
    if (data.warnings) {
      // Metadata is not yet attached to result, grab any data that needs to be added.
      metadata.warnings = data.warnings;
    }
    if (!func) {
      return Promise.resolve(data).then(attachMetadata(metadata));
    }
    return Promise.resolve(data).then(func).then(attachMetadata(metadata));
  };
  return captureMetadata;
};

/**
 * Utility function for displaying deprecation notices
 *
 * @memberof util
 * @param {Function} fn the function to deprecate
 * @param {String} msg the message to display to the user regarding deprecation
 */
function deprecate(fn, msg) {
  let alreadyWarned = false;
  function deprecated() {
    if (!alreadyWarned) {
      alreadyWarned = true;
      console.warn('DeprecationWarning: ' + msg);
    }

    return fn.apply(this, arguments);
  }

  deprecated.__proto__ = fn;  // eslint-disable-line
  if (fn.prototype) {
    deprecated.prototype = fn.prototype;
  }

  return deprecated;
}

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
  deprecate,
  serviceResponse,
  uriEncodeObject
};
