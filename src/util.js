import * as platform from 'detect-browser';
import * as base64 from 'Base64';

/**
 * Utility function for displaying deprecation notices
 *
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
 * Utility method for converting the rest response from services
 * into composable `thenables`. This allows us to use the same
 * API for calling helper methods (single-stage pipelines) and
 * pipeline building.
 *
 * @param {Object} service the service to execute the stages on
 * @param {Array} stages the pipeline stages to execute
 * @param {Function} [finalizer] optional function to call on the result of the response
 */
function serviceResponse(service, stages, finalizer) {
  if (service && !service.client) {
    throw new Error('Service has no client');
  }

  if (finalizer && typeof finalizer !== 'function') {
    throw new Error('Service response finalizer must be a function');
  }

  if (service.hasOwnProperty('__let__')) {
    if (Array.isArray(stages)) {
      // @todo: what do we do here?
      console.warn('`let` not yet supported on an array of stages');
    } else {
      stages.let = service.__let__;
    }
  }

  const client = service.client;
  Object.defineProperties(stages, {
    then: {
      enumerable: false, writable: false, configurable: false,
      value: (resolve, reject) => {
        let result = client.executePipeline(Array.isArray(stages) ? stages : [ stages ]);
        return (!!finalizer) ?
          result.then(finalizer).then(resolve, reject) : result.then(resolve, reject);
      }
    },
    catch: {
      enumerable: false, writable: false, configurable: false,
      value: (rejected) => {
        let result = client.executePipeline(Array.isArray(stages) ? stages : [ stages ]);
        return (!!finalizer) ?
          result.then(finalizer).catch(rejected) : result.catch(rejected);
      }
    },
    withLet: {
      enumerable: false, writable: true, configurable: true,
      value: (expr) => {
        if (Array.isArray(stages)) {
          // @todo: what do we do here?
          console.warn('`let` not yet supported on an array of stages');
        } else {
          stages.let = expr;
        }

        return stages;
      }
    },
    withPost: {
      enumerable: false, writable: true, configurable: true,
      value: (options) => {
        if (Array.isArray(stages)) {
          // @todo: what do we do here?
          console.warn('`post` not yet supported on an array of stages');
        } else {
          stages.post = options;
        }

        return stages;
      }
    }
  });

  return stages;
}

/**
 * Mixin that allows a definition of an optional `let` stage for
 * services is mixes in with.
 *
 * @param {*} Type the service to mixin
 */
function letMixin(Type) {
  Type.prototype.let = function(options) {
    Object.defineProperty(this, '__let__', {
      enumerable: false, configurable: false, writable: false, value: options
    });

    return this;
  };

  return Type;
}

/**
 * Utility function to get the platform.
 *
 * @returns {Object} An object of the form {name: ..., version: ...}, or null
 */
function getPlatform() {
  return platform ? platform : null;
}

/**
 * Utility function to encode a JSON object into a valid string that can be
 * inserted in a URI. The object is first stringified, then encoded in base64,
 * and finally encoded via the builtin encodeURIComponent function.
 *
 * @param {Object} obj The object to encode
 * @returns {String} The encoded object
 */
function uriEncodeObject(obj) {
  return encodeURIComponent(base64.btoa(JSON.stringify(obj)));
}

export {
  deprecate,
  serviceResponse,
  letMixin,
  getPlatform,
  uriEncodeObject
};
