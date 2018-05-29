import { Apps, checkEmpty, App } from "../Resources";
import * as EJSON from "mongodb-extjson";
import { Method, StitchAuthRequest } from "stitch-core";

/// View into a specific application
export default class AppResponse {
    private static readonly idKey = "_id";
    private static readonly nameKey = "name";
    private static readonly clientAppIdKey = "client_app_id";

    /// unique, internal id of this application
    public readonly id: String
    /// name of this application
    public readonly name: String
    /// public, client app id (for `StitchClient`) of this application
    public readonly clientAppId: String

    constructor(object: object) {
        this.id = object[AppResponse.idKey];
        this.name = object[AppResponse.nameKey];
        this.clientAppId = object[AppResponse.clientAppIdKey];
    }
}

/// POST a new application
    /// - parameter name: name of the new application
    /// - parameter defaults: whether or not to enable default values
Apps.prototype["create"] = (name: string, defaults: boolean): AppResponse => {
    const encodedApp = {name};
    const req = StitchAuthRequest.Builder()
        .withMethod(Method.POST)
        .withPath(`${this.url}?defaults=${defaults}`)
        .withBody(encodedApp)
        .build();

    const response = this.adminAuth.doAuthenticatedRequest(req)
    checkEmpty(response);
    return new AppResponse(EJSON.parse(response.body));
}

/// GET an application
/// - parameter id: id for the application
Apps.prototype["app"] = (appId: string): App => {
    return new App(this.adminAuth, `${this.url}/${appId}`)
}
