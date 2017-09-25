'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _s3_service = require('./aws/s3_service');

var _s3_service2 = _interopRequireDefault(_s3_service);

var _ses_service = require('./aws/ses_service');

var _ses_service2 = _interopRequireDefault(_ses_service);

var _sqs_service = require('./aws/sqs_service');

var _sqs_service2 = _interopRequireDefault(_sqs_service);

var _http_service = require('./http/http_service');

var _http_service2 = _interopRequireDefault(_http_service);

var _mongodb_service = require('./mongodb/mongodb_service');

var _mongodb_service2 = _interopRequireDefault(_mongodb_service);

var _pubnub_service = require('./pubnub/pubnub_service');

var _pubnub_service2 = _interopRequireDefault(_pubnub_service);

var _slack_service = require('./slack/slack_service');

var _slack_service2 = _interopRequireDefault(_slack_service);

var _twilio_service = require('./twilio/twilio_service');

var _twilio_service2 = _interopRequireDefault(_twilio_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  'aws/s3': _s3_service2.default,
  'aws/ses': _ses_service2.default,
  'aws/sqs': _sqs_service2.default,
  'http': _http_service2.default,
  'mongodb': _mongodb_service2.default,
  'pubnub': _pubnub_service2.default,
  'slack': _slack_service2.default,
  'twilio': _twilio_service2.default
};