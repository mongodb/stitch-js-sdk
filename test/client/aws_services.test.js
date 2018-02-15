const AWS = require('aws-sdk');
const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { BSON } from 'mongodb-extjson';
import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

// Returns true if AWS credentials are in env, false otehrwise.
function awsCredsInEnv() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

describe('Executing AWS service functions', () => {
  const test = new StitchMongoFixture();

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  const DEFAULT_AWS_REGION = 'us-east-1';

  let th;
  let service;
  let serviceId;

  describe('Executing S3 service functions', () => {
    const S3_API_VERSION  = '2006-03-01';
    const S3_SERVICE_TYPE = 'aws-s3';
    const S3_SERVICE_NAME = 'aws-s3-1';

    let awsClient = new AWS.S3({apiVersion: S3_API_VERSION});
    let bucketName = 'stitch-test-' + new BSON.ObjectId().toString();
    let objectKey = new BSON.ObjectId().toString();

    // Create S3 bucket
    beforeAll(async(done) => {
      if (awsCredsInEnv()) {
        AWS.config.update(
          {
            region: DEFAULT_AWS_REGION,
            credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)
          });
        awsClient.createBucket(
          {
            Bucket: bucketName
          },
          (err, data) => {
            if (err) {
              console.error('Error setting up S3 bucket for test', err);
              done.fail(err);
              return;
            }
            done();
          });
      } else {
        console.warn('skipping S3 tests since there are no AWS credentials in environment');
        done();
      }
    });

    // Remove S3 bucket
    afterAll(async(done) => {
      if (awsCredsInEnv()) {
        awsClient.deleteBucket(
          {
            Bucket: bucketName
          },
          (err, data) => {
            if (err) {
              console.error('Error tearing down S3 bucket for test', err);
              done.fail(err);
              return;
            }
            done();
          });
      } else {
        done();
      }
    });

    beforeEach(async() => {
      const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
      th = await buildClientTestHarness(apiKey, groupId, serverUrl);

      if (awsCredsInEnv()) {
        const s3Service = await th
          .app()
          .services()
          .create({
            type: S3_SERVICE_TYPE,
            name: S3_SERVICE_NAME,
            config: {
              region: DEFAULT_AWS_REGION,
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
          });

        service = th.stitchClient.service(S3_SERVICE_TYPE, S3_SERVICE_NAME);
        serviceId = s3Service._id;

        await th
          .app()
          .services()
          .service(serviceId)
          .rules()
          .create({
            name: 'awsS3Rule',
            actions: ['put', 'signPolicy'],
            when: {}
          });
      }
    });

    afterEach(async(done) => {
      await th.cleanup();
      if (awsCredsInEnv()) {
        awsClient.deleteObject({Bucket: bucketName, Key: objectKey}, (err, _) => {
          if (err) {
            console.error('Error deleting S3 object for test', err);
            done.fail(err);
            return;
          }
          done();
        });
      } else {
        done();
      }
    });

    it('should successfully put string content into the bucket', async() => {
      if (!awsCredsInEnv()) {
        return;
      }

      jest.setTimeout(15000);
      const { location } = await service.put(bucketName, objectKey, 'private', 'text', 'this is a string in an S3 bucket');
      expect(location).toBeDefined();
    });

    it('should successfully put binary content into the bucket', async() => {
      if (!awsCredsInEnv()) {
        return;
      }

      jest.setTimeout(15000);
      const { location } = await service.put(bucketName, objectKey, 'private', 'binary', new BSON.Binary('Hello World'));
      expect(location).toBeDefined();
    });

    it('should successfully sign an S3 policy', async() => {
      if (!awsCredsInEnv()) {
        return;
      }

      jest.setTimeout(15000);
      expect(await service.signPolicy(bucketName, objectKey, 'private', 'largeBinary')).toMatchObject(
        expect.objectContaining({
          policy: expect.any(String),
          signature: expect.any(String),
          credential: expect.any(String),
          algorithm: expect.any(String),
          date: expect.any(String)
        })
      );
    });
  });

  describe('Executing SES service functions', () => {
    const SES_SERVICE_TYPE = 'aws-ses';
    const SES_SERVICE_NAME = 'aws-ses-1';

    beforeEach(async() => {
      const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
      th = await buildClientTestHarness(apiKey, groupId, serverUrl);

      if (awsCredsInEnv()) {
        const sesService = await th
          .app()
          .services()
          .create({
            type: SES_SERVICE_TYPE,
            name: SES_SERVICE_NAME,
            config: {
              region: DEFAULT_AWS_REGION,
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
          });

        service = th.stitchClient.service(SES_SERVICE_TYPE, SES_SERVICE_NAME);
        serviceId = sesService._id;

        await th
          .app()
          .services()
          .service(serviceId)
          .rules()
          .create({
            name: 'awsSESRule',
            actions: ['send'],
            when: {}
          });
      }
    });

    it('should successfully send an email', async() => {
      if (!awsCredsInEnv()) {
        return;
      }

      const { messageId } = await service.send(
        'me@baas-dev.10gen.cc',
        'you@stitch-dev.10gen.cc',
        'this is the subject',
        'this is the body'
      );

      expect(messageId).toBeDefined();
    });
  });
});
