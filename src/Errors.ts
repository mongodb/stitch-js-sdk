// Sourced from https://github.com/Microsoft/TypeScript/issues/10166
type ErrorConstructor = new (message: string, code?: string) => Error;

/* tslint:disable:variable-name */
const _Error = (function (message: string, code?: string) {
  Error.call(this, message);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this);
  }

  this.message = message;
  this.name = this.constructor.name;

  if (code) {
    this.code = code;
  }
} as any) as ErrorConstructor;
_Error.prototype = Object.create(Error.prototype);
/* tslint:enable:variable-name */

class ResponseError extends _Error {
  public response: Response;

  public json: string;
}

class RealmError extends ResponseError {}

const ErrInvalidSession = 'InvalidSession';
const ErrUnauthorized = 'Unauthorized';

export { ResponseError, RealmError, ErrInvalidSession, ErrUnauthorized };
