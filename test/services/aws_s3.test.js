const sinon = require('sinon');
const S3Service = require('../../src/services/aws/s3_service');

class TestFixture {}
TestFixture.prototype.setup = function() {
  this.client = { executePipeline: sinon.stub().resolves('foo') };
  this.service = new S3Service(test.client, 'testS3');
};

const test = new TestFixture();
describe('S3Service', function() {
  describe('substages', () => {
    beforeEach(() => test.setup());

    it('should support a `let` substage', () => {
      return test.service
        .let({ test: '%%values.test' })
        .put('bucket', 'key', 'acl', 'contentType')
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('let');
          expect(stage.let).toEqual({ test: '%%values.test' });
        });
    });

    it('should support a `post` substage', () => {
      return test.service
        .put('bucket', 'key', 'acl', 'contentType')
        .withPost({ some: 'data' })
        .then(() => {
          const stage = test.client.executePipeline.getCall(0).args[0][0];
          expect(stage).toHaveProperty('post');
          expect(stage.post).toEqual({ some: 'data' });
        });
    });
  });
});
