import { EJSON } from "bson";
import { BSON, UserPasswordCredential } from "mongodb-stitch-core-sdk";
import { AdminFetchTransport, App, AppsResource, StitchAdminClient, Twilio } from "../src";
import { AnonProviderConfig, UserpassProvider, UserpassProviderConfig } from "../src/authProviders/ProviderConfigs";
import { StitchFunction } from "../src/functions/FunctionsResources";
import { MongoConfig, TwilioConfig } from "../src/services/ServiceConfigs";
import { StitchAdminUser } from "../src/StitchAdminUser";
import { User, UserCreator } from "../src/users/UsersResources";
import AdminClientTestHarness from "./AdminClientTestHarness";

const harness = new AdminClientTestHarness();
let stitchUser: User

beforeAll(() =>  harness.setup());

describe("admin client", () => {
	const app = harness.app;
	const appsResource = harness.appsResource;
	let func: StitchFunction;
	it("should create function", async () => {
		const config = new UserpassProviderConfig(
			"http://derp.com",
			"http://derp.com",
			"derp",
			"derp"
		)
		const provider = await harness.appsResource.app(harness.app.id).authProviders.create(
			new UserpassProvider(config));
		expect(provider.type).toEqual("local-userpass");
		stitchUser = await harness.appsResource.app(harness.app.id).users.create(new UserCreator("tester@10gen.com", "password"))

		func = await appsResource.app(app.id).functions.create(new StitchFunction(
			"echo",
			false,
			"exports = function(arg) { return arg; };",
			{}
		));
		
		expect(func.id).toBeDefined();
		expect(func.name).toEqual("echo");
	});

	it("should list functions", async () => {
		const funcs = await appsResource.app(app.id).functions.list();

		expect(funcs).toHaveLength(1);
		expect(funcs[0].id).toEqual(func.id);
		expect(funcs[0].name).toEqual(func.name);
	});

	it("should execute function", async() => {	
		const debugResult = await appsResource.app(app.id).debug.executeFunction(stitchUser.id, 'echo', 5);
		expect(debugResult.result).toEqual(5);
		expect(debugResult.stats.executionTime).toBeDefined();
	});

	it("should update function", async () => {
		func.source = "exports = function(arg){ return 4; };"
		await appsResource.app(app.id).functions.function(func.id).update(func)
		const debugResult = await appsResource.app(app.id).debug.executeFunction(stitchUser.id, 'echo', 5);
		expect(debugResult.result).toEqual(4);
		expect(debugResult.stats.executionTime).toBeDefined();
	});

	it("should remove function", async () => {
		await appsResource.app(app.id).functions.function(func.id).remove();
		const funcs = await appsResource.app(app.id).functions.list();

		expect(funcs).toHaveLength(0);
	});
});
