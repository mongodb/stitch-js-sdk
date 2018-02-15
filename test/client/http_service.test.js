const SimpleHttpServer = require('../fixtures/simple_http_server');
const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

describe('Executing http service functions', () => {
  const server = new SimpleHttpServer();
  const test = new StitchMongoFixture();

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  const SERVICE_TYPE = 'http';
  const SERVICE_NAME = 'gd2';

  let th;
  let service;
  let serviceId;

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);

    const httpService = await th
      .app()
      .services()
      .create({ type: SERVICE_TYPE, name: SERVICE_NAME });

    service = th.stitchClient.service(SERVICE_TYPE, SERVICE_NAME);
    serviceId = httpService._id;
  });

  afterEach(async() => await th.cleanup());

  describe('That have no matching service rules', () => {
    it('should fail due to no matching rule found', async() => {
      let err;
      try {
        await service.get(server.url);
      } catch (e) {
        err = e;
      }
      expect(err.code).toEqual('NoMatchingRuleFound');
    });
  });

  describe('That have proper service rules created', () => {
    beforeEach(async() => {
      await th
        .app()
        .services()
        .service(serviceId)
        .rules()
        .create({
          name: 'testRule',
          actions: ['get', 'post', 'put', 'patch', 'delete', 'head'],
          when: {}
        });
    });

    describe('And an unavailable mock server', () => {
      it('should fail due to a function execution error', async() => {
        let err;
        try {
          await service.get(server.url);
        } catch (e) {
          err = e;
        }
        expect(err.code).toEqual('FunctionExecutionError');
      });
    });

    describe('And an available mock server', () => {
      beforeAll(async() => {
        await server.listen();
      });
      afterAll(async() => {
        await server.close();
      });

      describe('Submitting an invalid request', () => {
        it('should fail when an invalid url value is supplied', async() => {
          let err;
          try {
            await service.get({ url: 'invalidurl' });
          } catch (e) {
            err = e;
          }
          expect(err.code).toEqual('FunctionExecutionError');
        });

        it('should fail when an invalid url datatype is supplied', async() => {
          let err;
          try {
            await service.get({ url: 10281995 });
          } catch (e) {
            err = e;
          }
          expect(err.code).toEqual('InvalidParameter');
        });

        it('should fail when both url and scheme+host are supplied', async() => {
          let err;
          try {
            await service.get({
              url: 'http://locahost',
              scheme: 'http',
              host: 'localhost'
            });
          } catch (e) {
            err = e;
          }
          expect(err.code).toEqual('InvalidParameter');
        });
      });

      describe('Submitting a GET request', () => {
        beforeAll(() => server.mockRequestHandler()
          .setStatusCode(200)
          .addHeader('Content-Type', 'text/plain')
          .addHeader('Warning', '622 Test GET warning')
          .textResponse('POW!'));

        it('with a string argument should send a successful request', async() => {
          const { statusCode, headers, body } = await service.get(server.url);

          expect(statusCode).toBe(200);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test GET warning');
          expect(body.toString()).toBe('POW!');
        });

        it('with an object argument should send a successful request', async() => {
          const { statusCode, headers, body } = await service.get({ url: server.url });

          expect(statusCode).toBe(200);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test GET warning');
          expect(body.toString()).toBe('POW!');
        });
      });

      describe('Submitting a POST request', () => {
        beforeAll(() => server.mockRequestHandler()
          .setStatusCode(201)
          .addHeader('Content-Type', 'text/plain')
          .addHeader('Warning', '622 Test POST warning')
          .echoResponse());

        it('with a string argument should send a successful request and return an empty response body', async() => {
          const { statusCode, headers, body } = await service.post(server.url);

          expect(statusCode).toBe(201);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test POST warning');
          expect(body.toString()).toBe('');
        });

        it('with an object argument containing the raw request body should send a successful request', async() => {
          const requestBody = { foo: 'bar' };
          const { statusCode, headers, body } = await service.post({
            url: server.url,
            body: requestBody,
            encodeBodyAsJSON: true
          });

          expect(statusCode).toBe(201);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test POST warning');
          expect(body.toString()).toBe(JSON.stringify(requestBody));
        });

        it('with an object argument containing the stringified request body should send a successful request', async() => {
          const requestBody = JSON.stringify({ foo: 'bar' });
          const { statusCode, headers, body } = await service.post({
            url: server.url,
            body: requestBody
          });

          expect(statusCode).toBe(201);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test POST warning');
          expect(body.toString()).toBe(requestBody);
        });
      });

      describe('Submitting a PUT request', () => {
        beforeAll(() => server.mockRequestHandler()
          .setStatusCode(201)
          .addHeader('Content-Type', 'text/plain')
          .addHeader('Warning', '622 Test PUT warning')
          .echoResponse());

        it('with a string argument should send a successful request and return an empty response body', async() => {
          const { statusCode, headers, body } = await service.put(server.url);

          expect(statusCode).toBe(201);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test PUT warning');
          expect(body.toString()).toBe('');
        });

        it('with an object argument containing the raw request body should send a successful request', async() => {
          const requestBody = { foo: 'bar' };
          const { statusCode, headers, body } = await service.put({
            url: server.url,
            body: requestBody,
            encodeBodyAsJSON: true
          });

          expect(statusCode).toBe(201);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test PUT warning');
          expect(body.toString()).toBe(JSON.stringify(requestBody));
        });

        it('with an object argument containing the stringified request body should send a successful request', async() => {
          const requestBody = JSON.stringify({ foo: 'bar' });
          const { statusCode, headers, body } = await service.put({
            url: server.url,
            body: requestBody
          });

          expect(statusCode).toBe(201);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test PUT warning');
          expect(body.toString()).toBe(requestBody);
        });
      });

      describe('Submitting a PATCH request', () => {
        beforeAll(() => server.mockRequestHandler()
          .setStatusCode(206)
          .addHeader('Content-Type', 'text/plain')
          .addHeader('Warning', '622 Test PATCH warning')
          .echoResponse());

        it('with a string argument should send a successful request and return an empty response body', async() => {
          const { statusCode, headers, body } = await service.patch(server.url);

          expect(statusCode).toBe(206);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test PATCH warning');
          expect(body.toString()).toBe('');
        });

        it('with an object argument containing the raw request body should send a successful request', async() => {
          const requestBody = { foo: 'bar' };
          const { statusCode, headers, body } = await service.patch({
            url: server.url,
            body: requestBody,
            encodeBodyAsJSON: true
          });

          expect(statusCode).toBe(206);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test PATCH warning');
          expect(body.toString()).toBe(JSON.stringify(requestBody));
        });

        it('with an object argument containing the stringified request body should send a successful request', async() => {
          const requestBody = JSON.stringify({ foo: 'bar' });
          const { statusCode, headers, body } = await service.patch({
            url: server.url,
            body: requestBody
          });

          expect(statusCode).toBe(206);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test PATCH warning');
          expect(body.toString()).toBe(requestBody);
        });
      });

      describe('Submitting a DELETE request', () => {
        beforeAll(() => server.mockRequestHandler()
          .setStatusCode(202)
          .addHeader('Content-Type', 'text/plain')
          .addHeader('Warning', '622 Test DELETE warning'));

        it('with a string argument should send a successful request', async() => {
          const { statusCode, headers, body } = await service.delete(server.url);

          expect(statusCode).toBe(202);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test DELETE warning');
          expect(body.toString()).toBe('');
        });

        it('with an object argument should send a successful request', async() => {
          const { statusCode, headers, body } = await service.delete({ url: server.url });

          expect(statusCode).toBe(202);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test DELETE warning');
          expect(body.toString()).toBe('');
        });
      });

      describe('Submitting a HEAD request', () => {
        beforeAll(() => server.mockRequestHandler()
          .setStatusCode(200)
          .addHeader('Content-Type', 'text/plain')
          .addHeader('Warning', '622 Test HEAD warning'));

        it('with a string argument should send a successful request', async() => {
          const { statusCode, headers, body } = await service.head(server.url);

          expect(statusCode).toBe(200);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test HEAD warning');
          expect(body.toString()).toBe('');
        });

        it('with an object argument should send a successful request', async() => {
          const { statusCode, headers, body } = await service.head({ url: server.url });

          expect(statusCode).toBe(200);
          expect(headers['Content-Type']).toContain('text/plain');
          expect(headers['Warning']).toContain('622 Test HEAD warning');
          expect(body.toString()).toBe('');
        });
      });
    });
  });
});
