import { EJSON } from "bson";
import { Method, StitchAuthRequest } from "mongodb-stitch-core-sdk";
import { jsonProperty, serialize } from "../JsonMapper"
import { BasicResource } from "../Resources"


export class CustomUserConfigData {
	constructor(
		@jsonProperty("mongo_service_id") public mongoServiceId: string,
		@jsonProperty("database_name") public databaseName: string,
		@jsonProperty("collection_name") public collectionName: string,
		@jsonProperty("user_id_field") public userIdField: string,
		@jsonProperty("enabled") public enabled: boolean) {
	}
}

export class CustomUserDataResource extends BasicResource<void> {
	// POST a new application
  // - parameter name: name of the new application
  // - parameter defaults: whether or not to enable default values
  public create(data: CustomUserConfigData): Promise<void> {
    const req = new StitchAuthRequest.Builder()
      .withMethod(Method.PATCH)
      .withPath(this.url)
      .withBody(EJSON.stringify(serialize(data)))
      .build();

    return this.adminAuth.doAuthenticatedRequest(req).then((_) => { return } );
  }
}
