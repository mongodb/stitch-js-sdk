/**
 * Creates a new BaasError
 *
 * @class
 * @augments Error
 * @param {String} message The error message
 * @param {Object} fields Optional fields to decorate the error with
 * @return {BaasError} A BaasError instance
 */
export class BaasError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'BaasError';
    this.message = message;
    if (code !== undefined) {
      this.code = code;
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}
