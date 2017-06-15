const sinon = require('sinon');
const HttpService = require('../../src/services/http/http_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executePipeline: sinon.stub().resolves('foo') };
  this.service = new HttpService(test.client, 'testHttpService');
};

const test = new TestFixture();
describe('HttpService', function() {
  describe('substages', () => {
    beforeEach(() => test.setup());

    it('should support a `let` substage', () => {
      return test.service
        .let({
          test: '%%values.test',
          auth: { $concat: [ 'Bearer ', '%%values.sg-api-key' ] }
        })
        .get('http://google.com')
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toEqual({
            service: 'testHttpService',
            action: 'get',
            args: { url: 'http://google.com' },
            'let': {
              test: '%%values.test',
              auth: { $concat: [ 'Bearer ', '%%values.sg-api-key' ] }
            }
          });
        });
    });

    it('should support a `post` substage', () => {
      return test.service
        .get('http://google.com')
        .withPost({ some: 'data' })
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('post');
          expect(stage.post).toEqual({ some: 'data' });
        });
    });
  });

  ['get', 'post', 'put', 'patch', 'delete', 'head'].forEach(method => {
    describe(method, () => {
      beforeEach(() => test.setup());
      it('should accept a string as the first argument', () => {
        return test.service[method]('http://google.com')
          .then(() => {
            const stage = test.client.executePipeline.getCall(0).args[0][0];
            const requestArgs = stage.args;
            expect(requestArgs).toEqual({ url: 'http://google.com' });
          });
      });

      it('should accept a string as the first argument and options', () => {
        return test.service[method]('http://google.com', { authUrl: 'llamas' })
          .then(() => {
            const stage = test.client.executePipeline.getCall(0).args[0][0];
            const requestArgs = stage.args;
            expect(requestArgs).toEqual({ url: 'http://google.com', authUrl: 'llamas' });
          });
      });

      it('should accept an object as the first argument', () => {
        return test.service[method]({ scheme: 'http', host: 'llamas.net', path: '/index.html' })
          .then(() => {
            const stage = test.client.executePipeline.getCall(0).args[0][0];
            const requestArgs = stage.args;
            expect(requestArgs)
              .toEqual({ scheme: 'http', host: 'llamas.net', path: '/index.html' });
          });
      });
    });
  });
});
