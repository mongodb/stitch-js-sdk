export function deprecate(fn, msg) {
  let alreadyWarned = false;
  function deprecated() {
    if (!alreadyWarned) {
      alreadyWarned = true;
      console.warn('DeprecationWarning: ' + msg);
    }

    return fn.apply(this, arguments);
  }

  Object.setPrototypeOf(deprecated, fn);
  if (fn.prototype) {
    deprecated.prototype = fn.prototype;
  }

  return deprecated;
}

export function serviceResponse(client, stages, finalizer) {
  if (finalizer && typeof finalizer !== 'function') {
    throw new Error('Service response finalizer must be a function');
  }

  Object.defineProperties(stages, {
    then: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: (resolve, reject) => {
        let result = client.executePipeline(Array.isArray(stages) ? stages : [ stages ]);
        return (!!finalizer) ?
          result.then(finalizer).then(resolve, reject) : result.then(resolve, reject);
      }
    },
    catch: {
      enumerable: false,
      writable: false,
      configurable: false,
      value: (rejected) => {
        let result = client.executePipeline(Array.isArray(stages) ? stages : [ stages ]);
        return (!!finalizer) ?
          result.then(finalizer).catch(rejected) : result.catch(rejected);
      }
    }
  });

  return stages;
}
