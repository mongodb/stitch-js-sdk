// @flow
import { codingkey, codingtype } from '../codable';

export class Identity {
  /// The provider specific Unique ID.
  id: string
  /// The provider of this identity.
  @codingkey('provider_id')
  providerId: string
  /// The provider of this identity.
  @codingkey('provider_type')
  providerType: string
}

export class UserProfile {
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
