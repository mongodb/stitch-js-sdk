import MongoDBService from './mongodb/mongodb_service';
import TwilioService from './twilio/twilio_service';

let services = new Map();
services.set('mongodb', MongoDBService);
services.set('twilio', TwilioService);

export default services;
