import { BaseStitchBrowserIntTestHarness } from "mongodb-stitch-browser-testutils";
import { 
	App, 
	AppResource,
	UserpassProvider, 
	UserpassProviderConfig, 
	StitchFunction, 
	User, 
	UserCreator 
} from "mongodb-stitch-core-admin-client";

const harness = new BaseStitchBrowserIntTestHarness();
let stitchUser: User

beforeAll(() =>  harness.setup());

describe("admin client", () => {
	let appResource: AppResource;
	const appsResource = harness.appsResource();
	let func: StitchFunction;
	it("should create function", async () => {
		const { appResource: unpackedAppResource } = await harness.createApp();
		appResource = unpackedAppResource;
		const config = new UserpassProviderConfig(
			"http://derp.com",
			"http://derp.com",
			"derp",
			"derp"
		)
		const provider = await appResource.authProviders.create(new UserpassProvider(config));
		expect(provider.type).toEqual("local-userpass");
		stitchUser = await appResource.users.create(new UserCreator("tester@10gen.com", "password"))

		func = await appResource.functions.create(new StitchFunction(
			"echo",
			false,
			"exports = function(arg) { return arg; };",
			{}
		));
		
		expect(func.id).toBeDefined();
		expect(func.name).toEqual("echo");
	});

	it("should list functions", async () => {
		const funcs = await appResource.functions.list();

		expect(funcs).toHaveLength(1);
		expect(funcs[0].id).toEqual(func.id);
		expect(funcs[0].name).toEqual(func.name);
	});

	it("should execute function", async() => {	
		const debugResult = await appResource.debug.executeFunction(stitchUser.id, 'echo', 5);
		expect(debugResult.result).toEqual(5);
		expect(debugResult.stats.executionTime).toBeDefined();
	});

	it("should update function", async () => {
		func.source = "exports = function(arg){ return 4; };"
		await appResource.functions.function(func.id).update(func)
		const debugResult = await appResource.debug.executeFunction(stitchUser.id, 'echo', 5);
		expect(debugResult.result).toEqual(4);
		expect(debugResult.stats.executionTime).toBeDefined();
	});

	it("should remove function", async () => {
		await appResource.functions.function(func.id).remove();
		const funcs = await appResource.functions.list();

		expect(funcs).toHaveLength(0);
	});
});
