// @flow

/**
 * Creates a new StitchError
 *
 * @class
 * @augments Error
 * @param {String} message The error message.
 * @param {Object} code The error code.
 * @return {StitchError} A StitchError instance.
 */
type _StitchError = { name: string, code: string, response: { status: number } };

class StitchError extends Error {
  code: string;
  status: number;
  name: string;
  response: { status: number };

  constructor(message: string, code: ?string, response: ?Response) {
    super(message);
    this.name = 'StitchError';
    this.message = message;

    if (code != null) {
      this.code = code;
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }

    if (response != null) {
      this.response = {
        status: response.status
      }
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
