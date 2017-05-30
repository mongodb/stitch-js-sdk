import S3Service from './aws/s3_service';
import SESService from './aws/ses_service';
import SQSService from './aws/sqs_service';
import HTTPService from './http/http_service';
import MongoDBService from './mongodb/mongodb_service';
import PubnubService from './pubnub/pubnub_service';
import SlackService from './slack/slack_service';
import TwilioService from './twilio/twilio_service';

export default {
  'aws/s3': S3Service,
  'aws/ses': SESService,
  'aws/sqs': SQSService,
  'http': HTTPService,
  'mongodb': MongoDBService,
  'pubnub': PubnubService,
  'slack': SlackService,
  'twilio': TwilioService
};
