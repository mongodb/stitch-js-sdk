import { BSON } from '../src/index';

describe('bson', function() {
  it('should have been exported', () => {
		 let objectId = new BSON.ObjectId();
		 expect(objectId).toBeDefined();
  });
});
