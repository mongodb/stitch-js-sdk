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

import * as EJSON from "mongodb-extjson";
import {
  Codec,
  Encoder,
  Method,
  StitchAuthRequest,
  StitchAuthRequestClient,
} from "mongodb-stitch-core-sdk";
import {
  AuthProviderResponse,
  AuthProviderResponseCodec
} from "./authProviders/AuthProvidersResources";
import {
  ProviderConfig,
  ProviderConfigCodec
} from "./authProviders/ProviderConfigs";
import {
  FunctionCreator,
  FunctionCreatorCodec,
  FunctionResponse,
  FunctionResponseCodec
} from "./functions/FunctionsResources";
import {
  RuleCreator,
  RuleCreatorCodec,
  RuleResponse,
  RuleResponseCodec
} from "./services/rules/RulesResources";
import { ServiceConfig, ServiceConfigCodec } from "./services/ServiceConfigs";
import {
  ServiceResponse,
  ServiceResponseCodec
} from "./services/ServicesResources";
import { StitchAdminRoutes } from "./StitchAdminResourceRoutes";
import {
  ConfirmationEmail,
  ConfirmationEmailCodec
} from "./userRegistrations/UserRegistrationsResources";
import {
  UserCreator,
  UserCreatorCodec,
  UserResponse,
  UserResponseCodec
} from "./users/UsersResources";

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}

/// Base implementation of Resource Protocol
export class BasicResource {
  public routes: StitchAdminRoutes;
  public authRequestClient: StitchAuthRequestClient;

  constructor(authRequestClient: StitchAuthRequestClient, routes: StitchAdminRoutes) {
    this.authRequestClient = authRequestClient;
    this.routes = routes;
  }
}

/// Adds an endpoint method that GETs some list
class Listable<T> extends BasicResource {
  public readonly codec: Codec<T>;

  public list(): Promise<T[]> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.routes.baseRoute);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        EJSON.parse(response.body!).map(val => this.codec.decode(val)));
  }
}

// / Adds an endpoint method that GETs some id
class Gettable<T> extends BasicResource {
  public readonly codec: Codec<T>;

  public get(): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.routes.baseRoute);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        this.codec.decode(EJSON.parse(response.body!)));
  }
}

// / Adds an endpoint method that DELETEs some id
class Removable extends BasicResource {
  public remove(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.DELETE).withPath(this.routes.baseRoute);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Adds an endpoint method that POSTs new data
class Creatable<Creator, T> extends BasicResource {
  public readonly codec: Codec<T>;
  public readonly creatorCodec: Encoder<Creator>;

  public create(data: Creator): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.routes.baseRoute)
      .withBody(EJSON.stringify(this.creatorCodec.encode(data)));

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        this.codec.decode(EJSON.parse(response.body!)));
  }
}

// / Adds an endpoint method that PUTs some data
class Updatable<T> extends BasicResource {
  public readonly updatableCodec: Codec<T>;

  public update(data: T): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.PUT)
      .withPath(this.routes.baseRoute)
      .withBody(EJSON.stringify(data));

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        this.updatableCodec.decode(EJSON.parse(response.body!))
      );
  }
}

// / Adds an endpoint that enables a given resource
class Enablable extends BasicResource {
  public enable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath(`${this.routes.baseRoute}/enable`);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Adds an endpoint that disables a given resource
class Disablable extends BasicResource {
  public disable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath(`${this.routes.baseRoute}/disable`);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Resource for a specific auth provider of an application
class AuthProviderResource extends BasicResource
  implements
    Gettable<AuthProviderResponse>,
    Updatable<AuthProviderResponse>,
    Removable,
    Enablable,
    Disablable {
  public readonly codec = new AuthProviderResponseCodec();
  public readonly updatableCodec = new AuthProviderResponseCodec();

  public get: () => Promise<AuthProviderResponse>;
  public update: (data: AuthProviderResponse) => Promise<AuthProviderResponse>;
  public remove: () => Promise<void>;
  public enable: () => Promise<void>;
  public disable: () => Promise<void>;
}
applyMixins(AuthProviderResource, [
  Gettable,
  Updatable,
  Removable,
  Enablable,
  Disablable
]);

// / Resource for listing the auth providers of an application
class AuthProvidersResource extends BasicResource
  implements
    Listable<AuthProviderResponse>,
    Creatable<ProviderConfig, AuthProviderResponse> {
  public readonly codec = new AuthProviderResponseCodec();
  public readonly creatorCodec = new ProviderConfigCodec();

  public create: (data: ProviderConfig) => Promise<AuthProviderResponse>;
  public list: () => Promise<AuthProviderResponse[]>;

  /// GET an auth provider
  /// - parameter providerId: id of the provider
  public authProvider(providerId: string): AuthProviderResource {
    return new AuthProviderResource(this.authRequestClient, `${this.url}/${providerId}`);
  }
}
applyMixins(AuthProvidersResource, [Listable, Creatable]);

// / Resource for user registrations of an application
class UserRegistrationsResource extends BasicResource {
  public sendConfirmation(email: string): Promise<ConfirmationEmail> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(`${this.url}/by_email/${email}/send_confirm`);

    return this.authRequestClient
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response =>
        new ConfirmationEmailCodec().decode(JSON.parse(response.body!))
      );
  }
}

// / Resource for a single user of an application
class UserResource extends BasicResource implements Gettable<UserResponse>, Removable {
  public readonly codec = new UserResponseCodec();

  public get: () => Promise<AuthProviderResponse>;
  public remove: () => Promise<void>;
}
applyMixins(UserResource, [Gettable, Removable]);

// / Resource for a list of users of an application
class UsersResource extends BasicResource
  implements Listable<UserResponse>, Creatable<UserCreator, UserResponse> {
  public readonly codec = new UserResponseCodec();
  public readonly creatorCodec = new UserCreatorCodec();

  public create: (data: UserCreator) => Promise<UserResponse>;
  public list: () => Promise<UserResponse[]>;

  public user(uid: string): UserResource {
    return new UserResource(this.authRequestClient, `${this.url}/${uid}`);
  }
}
applyMixins(UsersResource, [Listable, Creatable]);

class FunctionResource extends BasicResource
  implements Gettable<FunctionResponse>, Updatable<FunctionCreator>, Removable {
  public readonly codec = new FunctionResponseCodec();
  public readonly updatableCodec = new FunctionCreatorCodec();

  public get: () => Promise<FunctionResponse>;
  public update: (data: FunctionCreator) => Promise<FunctionCreator>;
  public remove: () => Promise<void>;
}
applyMixins(FunctionResource, [Gettable, Updatable, Removable]);

class FunctionsResource extends BasicResource
  implements
    Listable<FunctionResponse>,
    Creatable<FunctionCreator, FunctionResponse> {
  public readonly codec = new FunctionResponseCodec();
  public readonly creatorCodec = new FunctionCreatorCodec();

  public create: (data: FunctionCreator) => Promise<FunctionResponse>;
  public list: () => Promise<FunctionResponse[]>;

  // TSLint has an issue that the name of our class is Function
  /* tslint:disable */
  public function(fid: string): FunctionResource {
    return new FunctionResource(this.authRequestClient, `${this.url}/${fid}`);
  }
  /* tslint:enable */
}
applyMixins(FunctionsResource, [Creatable, Listable]);

// / Resource for a specific rule of a service
class RuleResource extends BasicResource implements Gettable<RuleResponse>, Removable {
  public codec = new RuleResponseCodec();

  public get: () => Promise<RuleResponse>;
  public remove: () => Promise<void>;
}
applyMixins(RuleResource, [Gettable, Removable]);

// / Resource for listing the rules of a service
class RulesResource extends BasicResource
  implements Listable<RuleResponse>, Creatable<RuleCreator, RuleResponse> {
  public creatorCodec = new RuleCreatorCodec();
  public codec = new RuleResponseCodec();

  public create: (data: RuleCreator) => Promise<RuleResponse>;
  public list: () => Promise<RuleResponse[]>;
}
applyMixins(RulesResource, [Creatable, Listable]);

// / Resource for a specific service of an application. Can fetch rules
// / of the service
class ServiceResource extends BasicResource
  implements Gettable<ServiceResponse>, Removable {
  public codec = new ServiceResponseCodec();

  public get: () => Promise<ServiceResponse>;
  public remove: () => Promise<void>;

  public readonly rules = new RulesResource(this.authRequestClient, `${this.url}/rules`);
}
applyMixins(ServiceResource, [Gettable, Removable]);

// / Resource for listing services of an application
class ServicesResource extends BasicResource
  implements
    Listable<ServiceResponse>,
    Creatable<ServiceConfig, ServiceResponse> {
  public creatorCodec = new ServiceConfigCodec();
  public codec = new ServiceResponseCodec();

  public list: () => Promise<ServiceResponse[]>;
  public create: (data: ServiceConfig) => Promise<ServiceResponse>;

  // / GET a service
  // / - parameter id: id of the requested service
  public service(id: string): ServiceResource {
    return new ServiceResource(this.authRequestClient, `${this.url}/${id}`);
  }
}
applyMixins(ServicesResource, [Listable, Creatable]);

export {
  Gettable,
  Updatable,
  Listable,
  Creatable,
  Enablable,
  Disablable,
  Removable,
  ServicesResource,
  ServiceResource,
  RulesResource,
  RuleResource,
  FunctionsResource,
  FunctionResource,
  UsersResource,
  UserResource,
  UserRegistrationsResource,
  AuthProviderResource,
  AuthProvidersResource
};
