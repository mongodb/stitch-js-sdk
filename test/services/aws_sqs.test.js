const sinon = require('sinon');
const SQSService = require('../../src/services/aws/sqs_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executePipeline: sinon.stub().resolves('foo') };
  this.service = new SQSService(test.client, 'testSQS');
};

const test = new TestFixture();
describe('SQSService', function() {
  describe('substages', () => {
    beforeEach(() => test.setup());

    it('should support a `let` argument', () => {
      return test.service
        .let({ test: '%%values.test' })
        .send()
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('let');
          expect(stage.let).toEqual({ test: '%%values.test' });
        });
    });
  });
});
