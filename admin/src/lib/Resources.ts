import * as EJSON from "mongodb-extjson";
import {
  Codec,
  Decoder,
  Encoder,
  Method,
  Response,
  StitchAuthRequest,
  StitchServiceErrorCode,
  StitchServiceException
} from "stitch-core";
import { AppResponse, AppResponseCodec } from "./apps/AppsResources";
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
import StitchAdminAuth from "./StitchAdminAuth";
import { ConfirmationEmail, ConfirmationEmailCodec } from "./userRegistrations/UserRegistrationsResources";
import {
  UserCreator,
  UserCreatorCodec,
  UserResponse,
  UserResponseCodec
} from "./users/UsersResources";

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
  public readonly codec: Codec<T>;

  public list(): Promise<T[]> {
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
  public readonly codec: Codec<T>;

  public get(): Promise<T> {
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
  public remove(): Promise<void> {
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
  public readonly codec: Codec<T>;
  public readonly creatorCodec: Encoder<Creator>;

  public create(data: Creator): Promise<T> {
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
  public readonly updatableCodec: Codec<T>;

  public update(data: T): Promise<T> {
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
  public enable(): Promise<void> {
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
  public disable(): Promise<void> {
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
  public readonly codec = new AuthProviderResponseCodec();
  public readonly updatableCodec = new AuthProviderResponseCodec();

  public get: () => Promise<AuthProviderResponse>;
  public update: (data: AuthProviderResponse) => Promise<AuthProviderResponse>;
  public remove: () => Promise<void>;
  public enable: () => Promise<void>;
  public disable: () => Promise<void>;
}

// / Resource for listing the auth providers of an application
class AuthProviders extends BasicResource
  implements
    Listable<AuthProviderResponse>,
    Creatable<ProviderConfig, AuthProviderResponse> {
  public readonly codec = new AuthProviderResponseCodec();
  public readonly creatorCodec = new ProviderConfigCodec();

  public create: (data: ProviderConfig) => Promise<AuthProviderResponse>;
  public list: () => Promise<AuthProviderResponse[]>;

  /// GET an auth provider
  /// - parameter providerId: id of the provider
  public authProvider(
    providerId: string
  ): AuthProvider {
    return new AuthProvider(this.adminAuth, `${this.url}/${providerId}`);
  };
}

// / Resource for user registrations of an application
class UserRegistrations extends BasicResource {
  public sendConfirmation(email: string): Promise<ConfirmationEmail> {
    const reqBuilder = new StitchAuthRequest.Builder()
    reqBuilder
            .withMethod(Method.POST)
            .withPath(`${this.url}/by_email/${email}/send_confirm`)

    return this.adminAuth.doAuthenticatedRequest(reqBuilder.build()).then((response) => 
      new ConfirmationEmailCodec().decode(JSON.parse(response.body!))
    )
  }
}

// / Resource for a single user of an application
class User extends BasicResource implements Gettable<UserResponse>, Removable {
  public readonly codec = new UserResponseCodec();

  public get: () => Promise<AuthProviderResponse>;
  public remove: () => Promise<void>;
}

// / Resource for a list of users of an application
class Users extends BasicResource
  implements Listable<UserResponse>, Creatable<UserCreator, UserResponse> {
  public readonly codec = new UserResponseCodec();
  public readonly creatorCodec = new UserCreatorCodec();

  public create: (data: UserCreator) => Promise<UserResponse>;
  public list: () => Promise<UserResponse[]>;
  
  public user(uid: string): User {
    return new User(this.adminAuth, `${this.url}/${uid}`);
  }
}

class Function extends BasicResource
  implements Gettable<FunctionResponse>, Updatable<FunctionCreator>, Removable {
  public readonly codec = new FunctionResponseCodec();
  public readonly updatableCodec = new FunctionCreatorCodec();

  public get: () => Promise<FunctionResponse>;
  public update: (data: FunctionCreator) => Promise<FunctionCreator>;
  public remove: () => Promise<void>;
}

class Functions extends BasicResource
  implements
    Listable<FunctionResponse>,
    Creatable<FunctionCreator, FunctionResponse> {
  public readonly codec = new FunctionResponseCodec();
  public readonly creatorCodec = new FunctionCreatorCodec();

  public create: (data: FunctionCreator) => Promise<FunctionResponse>;
  public list: () => Promise<FunctionResponse[]>;
  
  // TSLint has an issue that the name of our class is Function
  /* tslint:disable */
  public function(fid: string): Function {
    return new Function(this.adminAuth, `${this.url}/${fid}`);
  }
  /* tslint:enable */
}

// / Resource for a specific rule of a service
class Rule extends BasicResource implements Gettable<RuleResponse>, Removable {
  public codec = new RuleResponseCodec();

  public get: () => Promise<RuleResponse>;
  public remove: () => Promise<void>;
}

// / Resource for listing the rules of a service
class Rules extends BasicResource
  implements Listable<RuleResponse>, Creatable<RuleCreator, RuleResponse> {
  public creatorCodec = new RuleCreatorCodec();
  public codec = new RuleResponseCodec();

  public create: (data: RuleCreator) => Promise<RuleResponse>;
  public list: () => Promise<RuleResponse[]>;
}

// / Resource for a specific service of an application. Can fetch rules
// / of the service
class Service extends BasicResource
  implements Gettable<ServiceResponse>, Removable {
  public codec = new ServiceResponseCodec();

  public get: () => Promise<ServiceResponse>;
  public remove: () => Promise<void>;

  public readonly rules = new Rules(this.adminAuth, `${this.url}/rules`);
}

// / Resource for listing services of an application
class Services extends BasicResource
  implements
    Listable<ServiceResponse>,
    Creatable<ServiceConfig, ServiceResponse> {
  public creatorCodec = new ServiceConfigCodec();
  public codec = new ServiceResponseCodec();

  public list: () => Promise<ServiceResponse[]>;
  public create: (data: ServiceConfig) => Promise<ServiceResponse>;

  // / GET a service
  // / - parameter id: id of the requested service
  public service(id: string): Service {
    return new Service(this.adminAuth, `${this.url}/${id}`);
  }
}

class App extends BasicResource implements Gettable<AppResponse>, Removable {
  public readonly codec = new AppResponseCodec();

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

  public get: () => Promise<AppResponse>;
  public remove: () => Promise<void>;
}

class Apps extends BasicResource implements Listable<AppResponse> {
  public readonly codec = new AppResponseCodec();

  public list: () => Promise<AppResponse[]>;

  /// POST a new application
  /// - parameter name: name of the new application
  /// - parameter defaults: whether or not to enable default values
  public create(name: string, defaults: boolean = false): Promise<AppResponse> {
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
  public app(appId: string): App {
    return new App(this.adminAuth, `${this.url}/${appId}`);
  }
}

export {
  Apps,
  App,
  BasicResource,
  Gettable,
  Updatable,
  Listable,
  Creatable,
  Enablable,
  Disablable,
  Resource,
  Removable,
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
