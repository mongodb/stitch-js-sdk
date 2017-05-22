import S3Service from './aws/s3_service';
import SESService from './aws/ses_service';
import SQSService from './aws/sqs_service';
import HTTPService from './http/http_service';
import MongoDBService from './mongodb/mongodb_service';
import PubnubService from './pubnub/pubnub_service';
import SlackService from './slack/slack_service';
import TwilioService from './twilio/twilio_service';

let services = new Map();
services.set('aws/s3', S3Service);
services.set('aws/ses', SESService);
services.set('aws/sqs', SQSService);
services.set('http', HTTPService);
services.set('mongodb', MongoDBService);
services.set('pubnub', PubnubService);
services.set('slack', SlackService);
services.set('twilio', TwilioService);

export default services;
