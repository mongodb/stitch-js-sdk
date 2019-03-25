import { BSON, UserPasswordCredential } from "mongodb-stitch-core-sdk";
import { App, AppResource, AppsResource, StitchAdminClient } from "../src";

export default class AdminClientTestHarness {
	public appsResource: AppsResource;
	public appResource: AppResource;
	public groupId: string;
	public name: string;
	public app: App;
	private readonly adminClient = new StitchAdminClient();
	
	public async setup() {
		await this.adminClient.loginWithCredential(
			new UserPasswordCredential("unique_user@domain.com", "password"));
		this.groupId = (await this.adminClient.adminProfile()).roles[0].groupId;
		this.appsResource = this.adminClient.apps(this.groupId);
		this.name = `test-${new BSON.ObjectID().toHexString()}`;
		this.app = await this.appsResource.create(this.name);
		this.appResource = this.appsResource.app(this.app.id);
	}
}