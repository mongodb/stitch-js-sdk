const sinon = require('sinon');
const PubnubService = require('../../src/services/pubnub/pubnub_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executePipeline: sinon.stub().resolves('foo') };
  this.service = new PubnubService(test.client, 'testPubnub');
};

const test = new TestFixture();
describe('PubnubService', function() {
  describe('substages', () => {
    beforeEach(() => test.setup());

    it('should support a `let` substage', () => {
      return test.service
        .let({ test: '%%values.test' })
        .publish('test-channel', 'test-message')
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('let');
          expect(stage.let).toEqual({ test: '%%values.test' });
        });
    });

    it('should support a `post` substage', () => {
      return test.service
        .publish('test-channel', 'test-message')
        .withPost({ some: 'data' })
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('post');
          expect(stage.post).toEqual({ some: 'data' });
        });
    });
  });
});
