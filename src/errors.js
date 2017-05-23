/**
 * Creates a new BaasError
 *
 * @class
 * @augments Error
 * @param {String} message The error message.
 * @param {Object} code The error code.
 * @return {BaasError} A BaasError instance.
 */
class BaasError extends Error {
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

const ErrAuthProviderNotFound = 'AuthProviderNotFound';
const ErrInvalidSession = 'InvalidSession';
const ErrUnauthorized = 'Unauthorized';


export {
  BaasError,
  ErrAuthProviderNotFound,
  ErrInvalidSession,
  ErrUnauthorized
};
