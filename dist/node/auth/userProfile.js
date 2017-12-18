'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserProfile = exports.Identity = undefined;

var _dec, _dec2, _desc, _value, _class, _descriptor, _descriptor2, _dec3, _dec4, _desc2, _value2, _class3, _descriptor3, _descriptor4;

var _codable = require('../codable');

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

var Identity = exports.Identity = (_dec = (0, _codable.codingkey)('provider_id'), _dec2 = (0, _codable.codingkey)('provider_type'), (_class = function Identity() {
  _classCallCheck(this, Identity);

  _initDefineProp(this, 'providerId', _descriptor, this);

  _initDefineProp(this, 'providerType', _descriptor2, this);
}
/// The provider specific Unique ID.

/// The provider of this identity.

/// The provider of this identity.
, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'providerId', [_dec], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'providerType', [_dec2], {
  enumerable: true,
  initializer: null
})), _class));
var UserProfile = exports.UserProfile = (_dec3 = (0, _codable.codingkey)('user_id'), _dec4 = (0, _codable.codingtype)(Identity), (_class3 = function UserProfile() {
  _classCallCheck(this, UserProfile);

  _initDefineProp(this, 'id', _descriptor3, this);

  _initDefineProp(this, 'identities', _descriptor4, this);
}
/// What type of user this is

/// The set of identities that this user is known by.

/// The extra data associated with this user.
, (_descriptor3 = _applyDecoratedDescriptor(_class3.prototype, 'id', [_dec3], {
  enumerable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class3.prototype, 'identities', [_dec4], {
  enumerable: true,
  initializer: null
})), _class3));