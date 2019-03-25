// import { EJSON } from "bson";
// import { BSON, UserPasswordCredential } from "mongodb-stitch-core-sdk";
// import { AdminFetchTransport, AppResponse, Apps, Aws, FunctionCreator, RuleCreator, ServiceResponse, StitchAdminClient, Twilio } from "../src";
// import { AnonProviderConfig, UserpassProviderConfig } from "../src/authProviders/ProviderConfigs";
// import { FunctionResponse } from "../src/functions/FunctionsResources";
// import { MongoConfig, ServiceConfig, TwilioConfig } from "../src/services/ServiceConfigs";
// import { StitchAdminUser } from "../src/StitchAdminUser";
// import { UserCreator, UserResponse } from "../src/users/UsersResources";

// const baseUrl = ""
// const adminClient = new StitchAdminClient();
// let adminUser: StitchAdminUser;
// let appResponse: AppResponse;
// let appsResource: Apps;
// let groupId: string;
// let name: string;

// beforeAll(async () => {
// 	adminUser = await adminClient.loginWithCredential(
// 		new UserPasswordCredential("unique_user@domain.com", "password"));
// 	groupId = (await adminClient.adminProfile()).roles[0].groupId;

// 	name = `test-${new BSON.ObjectID().toHexString()}`;

// 	appsResource = adminClient.apps(groupId);
// 	const appsList = await appsResource.list();
// 	appsList.forEach(async (app) => {
// 		await appsResource.app(app.id).remove();
// 	});
// });

// describe("admin client", () => {
// 	it("should create app", async () => {
// 		appResponse = await appsResource.create(name);
		
// 		expect(appResponse.id).toBeDefined();
// 		expect(appResponse.clientAppId).toBeDefined();
// 		expect(appResponse.name).toEqual(name);
// 		expect(appResponse.groupId).toEqual(groupId);
// 		expect(appResponse.location).toBeDefined();
// 		expect(appResponse.deploymentModel).toEqual("GLOBAL");
// 		expect(appResponse.domainId).toBeDefined();
// 	});

// 	// it("should list app", async () => {
// 	// 	const appsList = await appsResource.list();
// 	// 	expect(appsList).toHaveLength(1);
// 	// 	expect(appsList[0]).toEqual(appResponse);
// 	// });

// 	// let stitchUser: UserResponse;
// 	// it("should add auth provider", async () => {
// 	// 	const config = new UserpassProviderConfig(
// 	// 		"http://derp.com",
// 	// 		"http://derp.com",
// 	// 		"derp",
// 	// 		"derp"
// 	// 	)
// 	// 	const provider = await appsResource.app(appResponse.id).authProviders.create(config);
// 	// 	expect(provider.type).toEqual(config.type);
// 	// 	stitchUser = await appsResource.app(appResponse.id).users.create(new UserCreator("tester@10gen.com", "password"))
// 	// });

// 	// let func: FunctionResponse;
// 	// it("should create function", async () => {
// 	// 	func = await appsResource.app(appResponse.id).functions.create(new FunctionCreator(
// 	// 		"echo",
// 	// 		false,
// 	// 		"exports = function(arg) { return arg; };",
// 	// 		{}
// 	// 	));
		
// 	// 	expect(func.id).toBeDefined();
// 	// 	expect(func.name).toEqual("echo");
// 	// });

// 	// it("should list functions", async () => {
// 	// 	const funcs = await appsResource.app(appResponse.id).functions.list();

// 	// 	expect(funcs).toHaveLength(1);
// 	// 	expect(funcs[0].id).toEqual(func.id);
// 	// 	expect(funcs[0].name).toEqual(func.name);
// 	// });

// 	// it("should execute function", async() => {
// 	// 	const debugResult = await appsResource.app(appResponse.id).debug.executeFunction(stitchUser.id, 'echo', 5);
// 	// 	expect(debugResult.result).toEqual(5);
// 	// 	expect(debugResult.stats.executionTime).toBeDefined();
// 	// });

// 	// it("should update function", async () => {
// 	// 	await appsResource.app(appResponse.id).functions.function(func.id).update(
// 	// 		new FunctionCreator(
// 	// 			"echo",
// 	// 			false,
// 	// 			"exports = function(arg){ return 4; };",
// 	// 			{}
// 	// 		)
// 	// 	)
// 	// });

// 	// it("should remove function", async () => {
// 	// 	await appsResource.app(appResponse.id).functions.function(func.id).remove();
// 	// 	const funcs = await appsResource.app(appResponse.id).functions.list();

// 	// 	expect(funcs).toHaveLength(0);
// 	// });

// 	// let service: ServiceResponse;
// 	// it("should add service", async() => {
// 	// 	service = 
// 	// 		await appsResource.app(
// 	// 			appResponse.id).services.create(ServiceConfig.twilio("twilio0", new TwilioConfig("1234", "5678")));
// 	// 	expect(service.name).toEqual("twilio0");
// 	// 	expect(service.type).toEqual("twilio");

// 	// 	console.log(await appsResource.app(appResponse.id).services.list());
// 	// 	// service = await appsResource.app(appResponse.id).services.create(ServiceConfig.mongo(new MongoConfig("localhost:26000")));
		
// 	// 	// await appsResource.app(appResponse.id).services.service(service.id).rules.create(RuleCreator.mongoDb("foo", {}));
// 	// })

// 	// it("should update service", async() => {
// 	// })
// });
