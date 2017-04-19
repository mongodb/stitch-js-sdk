'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new BaasError
 *
 * @class
 * @augments Error
 * @param {String} message The error message.
 * @param {Object} code The error code.
 * @return {BaasError} A BaasError instance.
 */

var BaasError = exports.BaasError = function (_Error) {
  _inherits(BaasError, _Error);

  function BaasError(message, code) {
    _classCallCheck(this, BaasError);

    var _this = _possibleConstructorReturn(this, (BaasError.__proto__ || Object.getPrototypeOf(BaasError)).call(this, message));

    _this.name = 'BaasError';
    _this.message = message;
    if (code !== undefined) {
      _this.code = code;
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(message).stack;
    }
    return _this;
  }

  return BaasError;
}(Error);