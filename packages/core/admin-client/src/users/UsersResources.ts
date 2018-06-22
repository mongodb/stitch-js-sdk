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

import { Codec } from "mongodb-stitch-core-sdk";
import { User } from "../Resources";

// / Creates a new user for an application
export interface UserCreator {
  readonly email: string;
  readonly password: string;
}

export class UserCreatorCodec implements Codec<UserCreator> {
  public decode(from: object): UserCreator {
    return {
      email: from.email,
      password: from.password
    };
  }

  public encode(from: UserCreator): object {
    return {
      email: from.email,
      password: from.password
    };
  }
}

// / View of a User of an application
enum Fields {
  Id = "_id"
}

export interface UserResponse {
  readonly id: string;
}

export class UserResponseCodec implements Codec<UserResponse> {
  public decode(from: object): UserResponse {
    return {
      id: from[Fields.Id]
    };
  }

  public encode(from: UserResponse): object {
    return {
      [Fields.Id]: from.id
    };
  }
}

interface Users {
  user(uid: string): User;
}
