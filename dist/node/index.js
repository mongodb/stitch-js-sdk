'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Admin = exports.Identity = exports.UserProfile = exports.StitchClient = undefined;

var _client = require('./client');

var _admin = require('./admin');

var _admin2 = _interopRequireDefault(_admin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.StitchClient = _client.StitchClient;
exports.UserProfile = _client.UserProfile;
exports.Identity = _client.Identity;
exports.Admin = _admin2.default;