const sinon = require('sinon');
const TwilioService = require('../../src/services/twilio/twilio_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executePipeline: sinon.stub().resolves('foo') };
  this.service = new TwilioService(test.client, 'testTwilio');
};

const test = new TestFixture();
describe('TwilioService', function() {
  describe('substages', () => {
    beforeEach(() => test.setup());

    it('should support a `let` argument', () => {
      return test.service
        .let({ test: '%%values.test' })
        .send('from', 'to', 'body')
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('let');
          expect(stage.let).toEqual({ test: '%%values.test' });
        });
    });
  });
});
