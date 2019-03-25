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

beforeAll(() => harness.setup());

describe("admin client", () => {
	const app = harness.app;
	const appsResource = harness.appsResource;
	const groupId = harness.groupId;
	const name = harness.name;

	it("should create app", async () =>  {
		expect(app.id).toBeDefined();
		expect(app.clientAppId).toBeDefined();
		expect(app.name).toEqual(name);
		expect(app.groupId).toEqual(groupId);
		expect(app.location).toBeDefined();
		expect(app.deploymentModel).toEqual("GLOBAL");
		expect(app.domainId).toBeDefined();
	});

	it("should list app", async () => {
		const appsList = await appsResource.list();
		expect(appsList).toContainEqual(app);
	});

	// let service: ServiceResponse;
	// it("should add service", async() => {
	// 	service = 
	// 		await appsResource.app(
	// 			appResponse.id).services.create(ServiceConfig.twilio("twilio0", new TwilioConfig("1234", "5678")));
	// 	expect(service.name).toEqual("twilio0");
	// 	expect(service.type).toEqual("twilio");

	// 	console.log(await appsResource.app(appResponse.id).services.list());
	// 	// service = await appsResource.app(appResponse.id).services.create(ServiceConfig.mongo(new MongoConfig("localhost:26000")));
		
	// 	// await appsResource.app(appResponse.id).services.service(service.id).rules.create(RuleCreator.mongoDb("foo", {}));
	// })

	// it("should update service", async() => {
	// })
});
