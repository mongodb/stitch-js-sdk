import StitchAdminAuth from "./StitchAdminAuth";
import {
  Method,
  StitchAuthRequest,
  Codec,
  Decoder,
  Encoder,
  StitchServiceException,
  StitchServiceErrorCode,
  Response
} from "stitch-core";
import * as EJSON from "mongodb-extjson";
import { AppResponse, AppResponseCodec } from "./apps/AppsResources";
import {
  AuthProviderResponse,
  AuthProviderResponseCodec
} from "./authProviders/AuthProvidersResources";
import {
  UserResponse,
  UserCreator,
  UserResponseCodec,
  UserCreatorCodec
} from "./users/UsersResources";
import {
  ProviderConfig,
  ProviderConfigCodec
} from "./authProviders/ProviderConfigs";
import {
  FunctionCreator,
  FunctionResponse,
  FunctionResponseCodec,
  FunctionCreatorCodec
} from "./functions/FunctionsResources";
import {
  ServiceResponse,
  ServiceResponseCodec
} from "./services/ServicesResources";
import { ServiceConfig, ServiceConfigCodec } from "./services/ServiceConfigs";
import {
  RuleResponse,
  RuleCreator,
  RuleCreatorCodec,
  RuleResponseCodec
} from "./services/rules/RulesResources";

/// Any endpoint that can be described with basic
/// CRUD operations
interface Resource {
  /// path to this endpoint
  url: string;
  /// stitch admin auth for making requests
  adminAuth: StitchAdminAuth;
}

/// Base implementation of Resource Protocol
class BasicResource implements Resource {
  public url: string;
  public adminAuth: StitchAdminAuth;

  constructor(adminAuth: StitchAdminAuth, url: string) {
    this.adminAuth = adminAuth;
    this.url = url;
  }
}

/**
 * Throws an error if the provided `Response` has an empty body.
 */
function checkEmpty(response: Response) {
  if (response.body === undefined) {
    throw new StitchServiceException(
      "unexpected empty response",
      StitchServiceErrorCode.Unknown
    );
  }
}

/// Adds an endpoint method that GETs some list
class Listable<T> extends BasicResource {
  readonly codec: Codec<T>;

  list(): Promise<T[]> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.url);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        return EJSON.parse(response.body).map(val => this.codec.decode(val));
      });
  }
}

// / Adds an endpoint method that GETs some id
class Gettable<T> extends BasicResource {
  readonly codec: Codec<T>;

  get(): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.GET).withPath(this.url);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        return this.codec.decode(EJSON.parse(response.body));
      });
  }
}

// / Adds an endpoint method that DELETEs some id
class Removable extends BasicResource {
  remove(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.DELETE).withPath(this.url);

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Adds an endpoint method that POSTs new data
class Creatable<Creator, T> extends BasicResource {
  readonly codec: Codec<T>;
  readonly creatorCodec: Encoder<Creator>;

  create(data: Creator): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.POST)
      .withPath(this.url)
      .withBody(EJSON.serialize(this.creatorCodec.encode(data)));

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => {
        return this.codec.decode(EJSON.parse(response.body));
      });
  }
}

// / Adds an endpoint method that PUTs some data
class Updatable<T> extends BasicResource {
  readonly updatableCodec: Codec<T>;

  update(data: T): Promise<T> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder
      .withMethod(Method.PUT)
      .withPath(this.url)
      .withBody(EJSON.serialize(data));

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(response => this.updatableCodec.decode(EJSON.parse(response.body)));
  }
}

// / Adds an endpoint that enables a given resource
class Enablable extends BasicResource {
  enable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath("${this.url}/enable");

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Adds an endpoint that disables a given resource
class Disablable extends BasicResource {
  disable(): Promise<void> {
    const reqBuilder = new StitchAuthRequest.Builder();
    reqBuilder.withMethod(Method.PUT).withPath("${this.url}/disable");

    return this.adminAuth
      .doAuthenticatedRequest(reqBuilder.build())
      .then(() => {
        return;
      });
  }
}

// / Resource for a specific auth provider of an application
class AuthProvider extends BasicResource
  implements
    Gettable<AuthProviderResponse>,
    Updatable<AuthProviderResponse>,
    Removable,
    Enablable,
    Disablable {
  readonly codec = new AuthProviderResponseCodec();
  readonly updatableCodec = new AuthProviderResponseCodec();

  get: () => Promise<AuthProviderResponse>;
  update: (data: AuthProviderResponse) => Promise<AuthProviderResponse>;
  remove: () => Promise<void>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

// / Resource for listing the auth providers of an application
class AuthProviders extends BasicResource
  implements
    Listable<AuthProviderResponse>,
    Creatable<ProviderConfig, AuthProviderResponse> {
  readonly codec = new AuthProviderResponseCodec();
  readonly creatorCodec = new ProviderConfigCodec();

  create: (data: ProviderConfig) => Promise<AuthProviderResponse>;
  list: () => Promise<AuthProviderResponse[]>;
}

// / Resource for user registrations of an application
class UserRegistrations extends BasicResource {}

// / Resource for a single user of an application
class User extends BasicResource implements Gettable<UserResponse>, Removable {
  readonly codec = new UserResponseCodec();

  get: () => Promise<AuthProviderResponse>;
  remove: () => Promise<void>;
}

// / Resource for a list of users of an application
class Users extends BasicResource
  implements Listable<UserResponse>, Creatable<UserCreator, UserResponse> {
  readonly codec = new UserResponseCodec();
  readonly creatorCodec = new UserCreatorCodec();

  user(uid: string): User {
    return new User(this.adminAuth, `${this.url}/${uid}`);
  }

  create: (data: UserCreator) => Promise<UserResponse>;
  list: () => Promise<UserResponse[]>;
}

class Function extends BasicResource
  implements Gettable<FunctionResponse>, Updatable<FunctionCreator>, Removable {
  readonly codec = new FunctionResponseCodec();
  readonly updatableCodec = new FunctionCreatorCodec();

  get: () => Promise<FunctionResponse>;
  update: (data: FunctionCreator) => Promise<FunctionCreator>;
  remove: () => Promise<void>;
}

class Functions extends BasicResource
  implements
    Listable<FunctionResponse>,
    Creatable<FunctionCreator, FunctionResponse> {
  readonly codec = new FunctionResponseCodec();
  readonly creatorCodec = new FunctionCreatorCodec();

  create: (data: FunctionCreator) => Promise<FunctionResponse>;
  list: () => Promise<FunctionResponse[]>;

  function(fid: string): Function {
    return new Function(this.adminAuth, `${this.url}/${fid}`);
  }
}

// / Resource for a specific rule of a service
class Rule extends BasicResource implements Gettable<RuleResponse>, Removable {
  codec = new RuleResponseCodec();

  get: () => Promise<RuleResponse>;
  remove: () => Promise<void>;
}

// / Resource for listing the rules of a service
class Rules extends BasicResource
  implements Listable<RuleResponse>, Creatable<RuleCreator, RuleResponse> {
  creatorCodec = new RuleCreatorCodec();
  codec = new RuleResponseCodec();

  create: (data: RuleCreator) => Promise<RuleResponse>;
  list: () => Promise<RuleResponse[]>;
}

// / Resource for a specific service of an application. Can fetch rules
// / of the service
class Service extends BasicResource
  implements Gettable<ServiceResponse>, Removable {
  codec = new ServiceResponseCodec();

  get: () => Promise<ServiceResponse>;
  remove: () => Promise<void>;

  public readonly rules = new Rules(this.adminAuth, `${this.url}/rules`);
}

// / Resource for listing services of an application
class Services extends BasicResource
  implements
    Listable<ServiceResponse>,
    Creatable<ServiceConfig, ServiceResponse> {
  creatorCodec = new ServiceConfigCodec();
  codec = new ServiceResponseCodec();

  list: () => Promise<ServiceResponse[]>;
  create: (data: ServiceConfig) => Promise<ServiceResponse>;

  // / GET a service
  // / - parameter id: id of the requested service
  service(id: string): Service {
    return new Service(this.adminAuth, `${this.url}/${id}`);
  }
}

class App extends BasicResource implements Gettable<AppResponse>, Removable {
  readonly codec = new AppResponseCodec();

  public readonly authProviders = new AuthProviders(
    this.adminAuth,
    "$url/auth_providers"
  );
  public readonly functions = new Functions(this.adminAuth, "$url/functions");
  public readonly services = new Services(this.adminAuth, "$url/services");
  public readonly users = new Users(this.adminAuth, "$url/users");
  public readonly userRegistrations = new UserRegistrations(
    this.adminAuth,
    "$url/user_registrations"
  );

  get: () => Promise<AppResponse>;
  remove: () => Promise<void>;
}

class Apps extends BasicResource implements Listable<AppResponse> {
  readonly codec = new AppResponseCodec();

  list: () => Promise<AppResponse[]>;

  /// POST a new application
  /// - parameter name: name of the new application
  /// - parameter defaults: whether or not to enable default values
  create(name: string, defaults: boolean): Promise<AppResponse> {
    const encodedApp = { name };
    const req = new StitchAuthRequest.Builder()
      .withMethod(Method.POST)
      .withPath(`${this.url}?defaults=${defaults}`)
      .withBody(JSON.stringify(encodedApp))
      .build();

    return this.adminAuth.doAuthenticatedRequest(req).then(response => {
      checkEmpty(response);
      return new AppResponseCodec().decode(EJSON.parse(response.body));
    });
  }

  /// GET an application
  /// - parameter id: id for the application
  app(appId: string): App {
    return new App(this.adminAuth, `${this.url}/${appId}`);
  }
}

export {
  Apps,
  App,
  Services,
  Service,
  Rules,
  Rule,
  Functions,
  Function,
  Users,
  User,
  UserRegistrations,
  AuthProvider,
  AuthProviders,
  checkEmpty
};
