import { BaseStitchBrowserIntTestHarness } from "mongodb-stitch-browser-testutils";
import { 
	AnonProviderConfig, 
	CustomUserConfigData, 
	MongoConfig,
	MongoDbRule,
	MongoDbService,
	Role,
	Rule,
	Schema,
	ServiceResource,
	StitchFunction,
	UserpassProvider,
	UserpassProviderConfig
} from "mongodb-stitch-core-admin-client";
import { UserPasswordCredential } from "mongodb-stitch-core-sdk";
import { StitchAppClient } from "mongodb-stitch-browser-core";

const harness = new BaseStitchBrowserIntTestHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

describe("StitchAppClient", () => {
	const db = "db1"
	const coll = "coll1"
	const functionName = "addUserProfile";
	const user = "stitch@10gen.com";
	const password = "stitchuser";
	const colorField = "favoriteColor";
	const favoriteColor = "blue";

	let client: StitchAppClient;

	it("should define custom data", async () => {
		const { app: appResponse, appResource: app } = await harness.createApp();
		await harness.addProvider(app, new AnonProviderConfig());
		const mongoConfg = new MongoConfig("mongodb://localhost:26000");
		const mongoService = new MongoDbService(mongoConfg);		
		const svc = await harness.addService(app, mongoService);
		
		await harness.addRule(svc[1] as ServiceResource<Rule, MongoDbService>, new MongoDbRule(
			db,
			coll,
			[new Role()],
			new Schema()));

		await harness.addProvider(app,
			new UserpassProvider(new UserpassProviderConfig(
			   "http://emailConfirmUrl.com",
			   "http://resetPasswordUrl.com",
			   "email subject",
			   "password subject")));
				
		await app.customUserData.create(new CustomUserConfigData(
			(svc[0] as MongoDbService).id,
			db,
			coll,
			"recoome",
			true));

		await app.functions.create(new StitchFunction(
			"addUserProfile",
			false,
			`
			exports = async function(color) {
				const coll = context.services.get("mongodb1")
				.db("${db}").collection("${coll}");
				await coll.insertOne({
					"recoome": context.user.id,
					"${colorField}": "${favoriteColor}"
				});
				return true;
			}
			`,
			undefined));

		client = harness.getAppClient(appResponse);
		await harness.registerAndLoginWithUserPass(app, client, user, password);
		expect(client.auth.user).toBeDefined();
		expect(client.auth.user!!.customData).toEqual({});

		await client.callFunction(functionName, [favoriteColor]);

		await client.auth.refreshCustomData();

		expect(client.auth.user!!.customData[colorField]).toEqual(favoriteColor);
	});

	it("should have custom data defined on login", async () => {
		await client.auth.logout();

		await client.auth.loginWithCredential(new UserPasswordCredential(user, password));

		expect(client.auth.user!!.customData[colorField]).toEqual(favoriteColor);
	})
});
