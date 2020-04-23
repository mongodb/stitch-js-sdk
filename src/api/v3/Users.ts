import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Identity')
export class Identity {
  @JsonProperty('id', String, true)
  public readonly id: string = '';

  @JsonProperty('provider_type')
  public readonly providerType: string = '';

  @JsonProperty('provider_id')
  public readonly providerId: string = '';

  @JsonProperty('provider_data', Any, true)
  public readonly providerData?: Record<string, Any> = undefined;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}

export enum UserType {
  Server = 'server',
  Normal = 'normal',
  System = 'system',
  Unknown = 'unknown',
}

@JsonObject('RoleAssignment')
export class RoleAssignment {
  @JsonProperty('role_name')
  public readonly roleName: string = '';

  @JsonProperty('group_id', String, true)
  public readonly groupId?: string = undefined;

  constructor(partial?: Partial<RoleAssignment>) {
    Object.assign(this, partial);
  }
}

@JsonObject('User')
export class User {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('domain_id')
  public readonly domainId: string = '';

  @JsonProperty('identities', [Identity], true)
  public readonly identities?: Identity[] = undefined;

  @JsonProperty('data', Any, true)
  public readonly data?: Record<string, Any> = undefined;

  @JsonProperty('sessions_valid_since')
  public readonly sessionsValidSince: number = 0;

  @JsonProperty('creation_date')
  public readonly creationDate: number = 0;

  @JsonProperty('last_authentication_date')
  public readonly value: number = 0;

  @JsonProperty('disabled')
  public readonly disabled: boolean = false;

  @JsonProperty('type')
  public readonly type: UserType = UserType.Unknown;

  @JsonProperty('roles', [RoleAssignment], true)
  public readonly roles?: RoleAssignment[] = undefined;

  @JsonProperty('custom_data', Any, true)
  public readonly customData?: Record<string, any> = undefined;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PartialUser')
export class PartialUser {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('identities', [Identity], true)
  public readonly identities?: Identity[] = undefined;

  @JsonProperty('type')
  public readonly type: UserType = UserType.Unknown;

  @JsonProperty('creation_date')
  public readonly name: number = 0;

  @JsonProperty('last_authentication_date')
  public readonly value: number = 0;

  @JsonProperty('disabled')
  public readonly disabled: boolean = false;

  @JsonProperty('data', Any, true)
  public readonly data?: Record<string, Any> = undefined;

  constructor(partial?: Partial<PartialUser>) {
    Object.assign(this, partial);
  }
}

@JsonObject('UserProfile')
export class UserProfile {
  @JsonProperty('user_id')
  public readonly userId: string = '';

  @JsonProperty('domain_id')
  public readonly domainId: string = '';

  @JsonProperty('identities', [Identity], true)
  public readonly identities?: Identity[] = undefined;

  @JsonProperty('custom_data', Any, true)
  public readonly customData?: Record<string, any> = undefined;

  @JsonProperty('data')
  public readonly data: Record<string, any> = {};

  @JsonProperty('type')
  public readonly type: UserType = UserType.Unknown;

  @JsonProperty('roles', [RoleAssignment], true)
  public readonly roles?: RoleAssignment[] = undefined;

  constructor(partial?: Partial<UserProfile>) {
    Object.assign(this, partial);
  }
}

export interface UserFilter {
  readonly descending?: boolean;
  readonly after?: string | [string, string];
  readonly status?: UserStatus;
  readonly providerTypes?: [string];
  readonly sort?: UsersSort;
  readonly limit?: number;
}

export enum UserStatus {
  Enabled = 'enabled',
  Disabled = 'disabled',
}

export enum UsersSort {
  Id = '_id',
  Status = 'status',
  CreatedDate = 'created_date',
  LastAuthDate = 'last_authentication_date',
}

@JsonObject('UserActionToken')
export class UserActionToken {
  @JsonProperty('token_id')
  public readonly tokenId: string = '';

  @JsonProperty('token')
  public readonly token: string = '';

  constructor(partial?: Partial<UserActionToken>) {
    Object.assign(this, partial);
  }
}

@JsonObject('EmailPasswordRegistrationRequest')
export class EmailPasswordRegistrationRequest {
  @JsonProperty('email')
  public readonly email: string = '';

  @JsonProperty('password')
  public readonly password: string = '';

  constructor(partial?: Partial<EmailPasswordRegistrationRequest>) {
    Object.assign(this, partial);
  }
}

@JsonObject('Device')
export class Device {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('client_app_version')
  public readonly clientAppVersion: string = '';

  @JsonProperty('platform')
  public readonly platform: string = '';

  @JsonProperty('platform_version')
  public readonly platformVersion: string = '';

  constructor(partial?: Partial<Device>) {
    Object.assign(this, partial);
  }
}

export enum LoginIDType {
  Email = 'email',
  Username = 'username',
}

@JsonObject('LoginId')
export class LoginId {
  @JsonProperty('id_type')
  public readonly idType: LoginIDType = LoginIDType.Email;

  @JsonProperty('id')
  public readonly id: string = '';

  @JsonProperty('confirmed', Boolean, true)
  public readonly confirmed?: boolean = undefined;

  constructor(partial?: Partial<LoginId>) {
    Object.assign(this, partial);
  }
}

@JsonObject('PasswordRecord')
export class PasswordRecord {
  @JsonProperty('_id')
  public readonly id: string = '';

  @JsonProperty('domain_id')
  public readonly domainId: string = '';

  @JsonProperty('login_ids')
  public readonly loginIds: LoginId[] = [];

  @JsonProperty('user_id')
  public readonly userId: string = '';

  constructor(partial?: Partial<PasswordRecord>) {
    Object.assign(this, partial);
  }
}
