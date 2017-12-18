// @flow
/* global expect, it, describe, global, afterEach, beforeEach, afterAll, beforeAll, require, Buffer, Promise */

import { decode, codingtype, codingkey, encode } from '../src/codable.js';

const userProfileJson = {
    user_id: "dummy_user_id",
    type: "dummy_type",
    identities: [
    	{
    		id: "dummy_id_0",
    		provider_id: "dummy_provider_id_0",
    		provider_type: "dummy_provider_type_0"
    	},
    	{
    		id: "dummy_id_1",
    		provider_id: "dummy_provider_id_1",
    		provider_type: "dummy_provider_type_1"
    	}
    ],
    data: null
}

class Identity {
  /// The provider specific Unique ID.
  id: string
  /// The provider of this identity.
  @codingkey('provider_id')
  providerId: string
  /// The provider of this identity.
  @codingkey('provider_type')
  providerType: string
}

class UserProfile {
  /// The Unique ID of this user within Stitch.
  @codingkey('user_id')
  id: string
  /// What type of user this is
  type: string
  /// The set of identities that this user is known by.
  @codingtype(Identity)
  identities: Array<Identity>
  /// The extra data associated with this user.
  data: Object
}

describe('Codable interface', () => {
	it('should decode our data type from a json string', () => {
		let userProfile = decode(userProfileJson, UserProfile);
		expect(userProfile.id).toEqual("dummy_user_id");
    expect(userProfile.type).toEqual("dummy_type");
    expect(userProfile.identities[0].id).toEqual("dummy_id_0");
    expect(userProfile.identities[0].providerId).toEqual("dummy_provider_id_0");
    expect(userProfile.identities[0].providerType).toEqual("dummy_provider_type_0");
    expect(userProfile.identities[1].id).toEqual("dummy_id_1");
    expect(userProfile.identities[1].providerId).toEqual("dummy_provider_id_1");
    expect(userProfile.identities[1].providerType).toEqual("dummy_provider_type_1");
    expect(userProfile.data).toEqual(null);
	})
});
