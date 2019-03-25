/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { applyMixins, BasicResource } from "../Resources";
import { jsonProperty } from "../SerializeDecorator";

// / Creates a new user for an application
export class UserCreator {
  @jsonProperty("email")
  public readonly email: string;
  @jsonProperty("password")
  public readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class User extends UserCreator {
  @jsonProperty("_id")
  public readonly id?: string;
}

// Resource for a single user of an application
export class UserResource extends BasicResource<User> {
  public get: () => Promise<User>;
  public remove: () => Promise<void>;
}

// Resource for a list of users of an application
export class UsersResource extends BasicResource<User> {
  public create(data: UserCreator): Promise<User> {
    return this._create(data, User)
  }

  public list(): Promise<User[]> {
    return this._list(User);
  }

  public user(uid: string): UserResource {
    return new UserResource(this.adminAuth, `${this.url}/${uid}`);
  }
}
