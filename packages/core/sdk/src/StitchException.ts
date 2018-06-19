// sourced from https://github.com/Microsoft/TypeScript/issues/10166
interface ErrorConstructor {
  new (message:string) : Error;
}

const _Error = function(message:string) {
  Error.call(this, message);
  Error.captureStackTrace(this);

  this.message = message;
  this.name = this.constructor.name;
} as any as ErrorConstructor;
_Error.prototype = Object.create(Error.prototype);

/**
 * StitchExceptions represent a class of exceptions that happen while utilizing the Stitch SDK and
 * communicating Stitch. Most Stitch exception types will inherit from this base class.
 */
export default class StitchException extends _Error {}
