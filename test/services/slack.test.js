const sinon = require('sinon');
const SlackService = require('../../src/services/slack/slack_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executePipeline: sinon.stub().resolves('foo') };
  this.service = new SlackService(test.client, 'testSlack');
};

const test = new TestFixture();
describe('SlackService', function() {
  describe('substages', () => {
    beforeEach(() => test.setup());

    it('should support a `let` argument', () => {
      return test.service
        .let({ test: '%%values.test' })
        .post('test-channel', 'test-message')
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('let');
          expect(stage.let).toEqual({ test: '%%values.test' });
        });
    });
  });
});
