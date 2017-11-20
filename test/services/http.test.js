const sinon = require('sinon');
const HttpService = require('../../src/services/http/http_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executeServiceFunction: sinon.stub().resolves('foo') };
  this.service = new HttpService(test.client, 'testHttpService');
};
const test = new TestFixture();

describe('HttpService', function() {
  ['get', 'post', 'put', 'patch', 'delete', 'head'].forEach(method => {
    describe(method, () => {
      beforeEach(() => test.setup());
      it('should accept a string as the first argument', () => {
        return test.service[method]('http://google.com')
          .then(() => {
            const requestArgs = test.client.executeServiceFunction.getCall(0).args.slice(2);
            expect(requestArgs).toEqual([{ url: 'http://google.com' }]);
          });
      });

      it('should accept a string as the first argument and options', () => {
        return test.service[method]('http://google.com', { authUrl: 'llamas' })
          .then(() => {
            const requestArgs = test.client.executeServiceFunction.getCall(0).args.slice(2);
            expect(requestArgs).toEqual([{ url: 'http://google.com', authUrl: 'llamas' }]);
          });
      });

      it('should accept an object as the first argument', () => {
        return test.service[method]({ scheme: 'http', host: 'llamas.net', path: '/index.html' })
          .then(() => {
            const requestArgs = test.client.executeServiceFunction.getCall(0).args.slice(2);
            expect(requestArgs)
              .toEqual([{ scheme: 'http', host: 'llamas.net', path: '/index.html' }]);
          });
      });
    });
  });
});
