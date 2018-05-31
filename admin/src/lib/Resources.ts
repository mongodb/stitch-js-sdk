import StitchAdminAuth from "./StitchAdminAuth";
import { Method, StitchAuthRequest } from "stitch-core";
import * as EJSON from "mongodb-extjson";
import AppResponse from "./apps/AppsResources";
import { Codec } from "./Codec";
import { AuthProviderResponse, AuthProviderResponseCodec } from "./authProviders/AuthProvidersResources";

/// Any endpoint that can be described with basic
/// CRUD operations
interface Resource {
    /// path to this endpoint
    url: string
    /// stitch admin auth for making requests
    adminAuth: StitchAdminAuth
}

/// Base implementation of Resource Protocol
class BasicResource implements Resource {
    public url: string
    public adminAuth: StitchAdminAuth

    constructor(adminAuth: StitchAdminAuth, url: string) {
        this.adminAuth = adminAuth
        this.url = url
    }
}

/**
 * Throws an error if the provided `Response` has an empty body.
 */
function checkEmpty(response: Response) {
    if (response.body === undefined) {
        throw StitchError.serviceError("unexpected empty response", StitchErrorCodes.unknown)
    }
}

/// Adds an endpoint method that GETs some list
class Listable<T> extends BasicResource {
    list(): Promise<T[]> {
        const reqBuilder = StitchAuthRequest.Builder()
        reqBuilder.withMethod(Method.GET)
            .withPath(this.url)
    
        return this.adminAuth.doAuthenticatedRequest(reqBuilder.build()).then(response => {
            return EJSON.parse(response.body);
        });
    }
}

// / Adds an endpoint method that GETs some id
class Gettable<T> extends BasicResource {
    private readonly codec: { new(): Codec<T> }

    get(): Promise<T> {
        const reqBuilder = StitchAuthRequest.Builder()
        reqBuilder
            .withMethod(Method.GET)
            .withPath(this.url);

        return this.adminAuth.doAuthenticatedRequest(reqBuilder.build()).then(response => {
            return new this.codec().decode(EJSON.parse(response.body));
        });
    }
}


// / Adds an endpoint method that DELETEs some id
class Removable extends BasicResource {
    remove(): Promise<void> {
        const reqBuilder = StitchAuthRequest.Builder()
        reqBuilder
                .withMethod(Method.DELETE)
                .withPath(this.url)
    
        return this.adminAuth.doAuthenticatedRequest(reqBuilder.build()).then(() => { return });
    }
}

// / Adds an endpoint method that POSTs new data
class Creatable<Creator, T, V extends Codec<T>> extends BasicResource {
    create(data: Creator): Promise<T> {
        const reqBuilder = StitchAuthRequest.Builder()
        reqBuilder
                .withMethod(Method.POST)
                .withPath(this.url)
                .withBody(EJSON.serialize(data))
    
        return this.adminAuth.doAuthenticatedRequest(reqBuilder.build()).then(response => {
            return new V().decode(EJSON.parse(response.body));
        });
    }
}

// / Adds an endpoint method that PUTs some data
interface Updatable<T> extends BasicResource {

}
Updatable.prototype.update = (data: T): T => {
    const reqBuilder = StitchAuthRequest.Builder()
    reqBuilder
            .withMethod(Method.PUT)
            .withPath(this.url)
            .withBody(EJSON.serialize(data))

    const response = this.adminAuth.doAuthenticatedRequest(reqBuilder.build())
    return new T(EJSON.parse(response.body));

}

// / Adds an endpoint that enables a given resource
interface Enablable extends Resource {
}

Enablable.prototype.enable = () => {
    const reqBuilder = StitchAuthRequest.Builder()
    reqBuilder
            .withMethod(Method.PUT)
            .withPath("${this.url}/enable")

    this.adminAuth.doAuthenticatedRequest(reqBuilder.build())
}

// / Adds an endpoint that disables a given resource
interface Disablable extends Resource {}

Disablable.prototype.disable = () => {
    const reqBuilder = StitchAuthRequest.Builder()
    reqBuilder
            .withMethod(Method.PUT)
            .withPath("${this.url}/disable")

    this.adminAuth.doAuthenticatedRequest(reqBuilder.build())
}

// / Resource for a specific auth provider of an application
class AuthProvider extends
    BasicResource implements
    Gettable<AuthProviderResponse>,
    Updatable<AuthProviderResponse>,
    Removable,
    Enablable,
    Disablable {
    private readonly codec = AuthProviderResponseCodec

    get: () => Promise<AuthProviderResponse>
}

// / Resource for listing the auth providers of an application
class AuthProviders extends BasicResource 
    implements Listable<AuthProvidersResponse>, Creatable<ProviderConfigWrapper, AuthProvidersResponse> {
}

// / Resource for user registrations of an application
class UserRegistrations extends BasicResource {}

// / Resource for a single user of an application
class User extends
    BasicResource implements Gettable<UserResponse>, Removable {}

// / Resource for a list of users of an application
class Users extends BasicResource 
    implements Listable<UserResponse>, Creatable<UserCreator, UserResponse> {
}

class Function extends
                    BasicResource implements
                    Gettable<FunctionResponse>,
                    Updatable<FunctionCreator>,
                    Removable {
}

class Functions extends
                BasicResource implements
                Listable<FunctionResponse>,
                Creatable<FunctionCreator, FunctionResponse> {
}

// / Resource for a specific rule of a service
class Rule extends BasicResource implements Gettable<RuleResponse>, Removable {    
}

// / Resource for listing the rules of a service
class Rules extends
        BasicResource implements
        Listable<RuleResponse>,
        Creatable<RuleCreator, RuleResponse> {
}

// / Resource for a specific service of an application. Can fetch rules
// / of the service
class Service extends
    BasicResource implements
    Gettable<ServiceResponse>, Removable {
    public readonly rules = new Rules(this.adminAuth, "$url/rules");
}

// / Resource for listing services of an application
class Services extends
    BasicResource implements
    Listable<ServiceResponse>,
    Creatable<ServiceConfigWrapper, ServiceResponse> {
}

class App extends BasicResource 
    implements Gettable<AppResponse>, Removable {
    public readonly authProviders = new AuthProviders(this.adminAuth, "$url/auth_providers");
    public readonly functions = new Functions(this.adminAuth, "$url/functions");
    public readonly services = new Services(this.adminAuth, "$url/services");
    public readonly users = new Users(this.adminAuth, "$url/users");
    public readonly userRegistrations = new UserRegistrations(this.adminAuth, "$url/user_registrations");
}

class Apps extends
        BasicResource implements Listable<AppResponse> {
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