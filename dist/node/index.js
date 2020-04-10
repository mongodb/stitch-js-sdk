'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BSON = exports.StitchAdminClientFactory = exports.StitchClientFactory = undefined;

var _client = require('./client');

var _admin = require('./admin');

var _bson = require('bson');

var _bson2 = _interopRequireDefault(_bson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.StitchClientFactory = _client.StitchClientFactory;
exports.StitchAdminClientFactory = _admin.StitchAdminClientFactory;
exports.BSON = _bson2.default;