/**
 * Creates a new StitchError
 *
 * @class
 * @augments Error
 * @param {String} message The error message.
 * @param {Object} code The error code.
 * @return {StitchError} A StitchError instance.
 */
class StitchError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'StitchError';
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
  StitchError,
  ErrAuthProviderNotFound,
  ErrInvalidSession,
  ErrUnauthorized
};
