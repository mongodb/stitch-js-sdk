import S3Service from './aws/s3_service';
import SESService from './aws/ses_service';
import HTTPService from './http/http_service';
import MongoDBService from './mongodb/mongodb_service';
import TwilioService from './twilio/twilio_service';

export default {
  'aws-s3': S3Service,
  'aws-ses': SESService,
  'http': HTTPService,
  'mongodb': MongoDBService,
  'twilio': TwilioService
};
