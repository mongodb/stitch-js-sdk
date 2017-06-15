const sinon = require('sinon');
const SESService = require('../../src/services/aws/ses_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executePipeline: sinon.stub().resolves('foo') };
  this.service = new SESService(test.client, 'testSES');
};

const test = new TestFixture();
describe('SESService', function() {
  describe('substages', () => {
    beforeEach(() => test.setup());

    it('should support a `let` substage', () => {
      return test.service
        .let({ test: '%%values.test' })
        .send('from', 'to', 'subject', 'body')
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('let');
          expect(stage.let).toEqual({ test: '%%values.test' });
        });
    });

    it('should support a `post` substage', () => {
      return test.service
        .send('from', 'to', 'subject', 'body')
        .withPost({ some: 'data' })
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('post');
          expect(stage.post).toEqual({ some: 'data' });
        });
    });
  });
});
