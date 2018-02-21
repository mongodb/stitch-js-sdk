'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _s3_service = require('./aws/s3_service');

var _s3_service2 = _interopRequireDefault(_s3_service);

var _ses_service = require('./aws/ses_service');

var _ses_service2 = _interopRequireDefault(_ses_service);

var _http_service = require('./http/http_service');

var _http_service2 = _interopRequireDefault(_http_service);

var _mongodb_service = require('./mongodb/mongodb_service');

var _mongodb_service2 = _interopRequireDefault(_mongodb_service);

var _twilio_service = require('./twilio/twilio_service');

var _twilio_service2 = _interopRequireDefault(_twilio_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  'aws-s3': _s3_service2.default,
  'aws-ses': _ses_service2.default,
  'http': _http_service2.default,
  'mongodb': _mongodb_service2.default,
  'twilio': _twilio_service2.default
};
module.exports = exports['default'];