'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.builtins = exports.Admin = exports.StitchClient = undefined;

var _client = require('./client');

var _builtins = require('./builtins');

var _builtins2 = _interopRequireDefault(_builtins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.StitchClient = _client.StitchClient;
exports.Admin = _client.Admin;
exports.builtins = _builtins2.default;