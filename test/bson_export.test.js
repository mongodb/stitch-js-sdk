import { BSON } from '../src/index';

describe('bson', function() {
	it('should have been exported', () => {
		 let objectId = BSON.ObjectId();
		 expect(objectId).toBeDefined();
	});
});
