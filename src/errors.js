const _Error = function(message, code) {
  Error.call(this, message);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this);
  }

  this.message = message;
  this.name = this.constructor.name;

  if (code !== undefined) {
    this.code = code;
  }
};
_Error.prototype = Object.create(Error.prototype);

class StitchError extends _Error {}

const ErrAuthProviderNotFound = 'AuthProviderNotFound';
const ErrInvalidSession = 'InvalidSession';
const ErrUnauthorized = 'Unauthorized';


export {
  StitchError,
  ErrAuthProviderNotFound,
  ErrInvalidSession,
  ErrUnauthorized
};
