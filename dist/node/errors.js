'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Error = function _Error(message, code) {
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

var StitchError = function (_Error2) {
  _inherits(StitchError, _Error2);

  function StitchError() {
    _classCallCheck(this, StitchError);

    return _possibleConstructorReturn(this, (StitchError.__proto__ || Object.getPrototypeOf(StitchError)).apply(this, arguments));
  }

  return StitchError;
}(_Error);

var ErrAuthProviderNotFound = 'AuthProviderNotFound';
var ErrInvalidSession = 'InvalidSession';
var ErrUnauthorized = 'Unauthorized';

exports.StitchError = StitchError;
exports.ErrAuthProviderNotFound = ErrAuthProviderNotFound;
exports.ErrInvalidSession = ErrInvalidSession;
exports.ErrUnauthorized = ErrUnauthorized;