import { BaseStitchBrowserIntTestHarness } from "mongodb-stitch-browser-testutils";
import { App, AppResource } from "../src";

const harness = new BaseStitchBrowserIntTestHarness();

beforeAll(() => harness.setup());

describe("admin client", () => {
	
	// let app: App;
	// let appsResource: AppsResource;
	let app: App;
	let appResource: AppResource

	it("should create app", async () =>  {
		const { app: created, appResource: linkedResource } = (await harness.createApp())
		app = created;
		appResource = linkedResource;

		expect(app.id).toBeDefined();
		expect(app.clientAppId).toBeDefined();
		expect(app.name).toBeDefined();
		expect(app.groupId).toBeDefined();
		expect(app.location).toBeDefined();
		expect(app.deploymentModel).toEqual("GLOBAL");
		expect(app.domainId).toBeDefined();
	});

	it("should list app", async () => {
		const appsList = await harness.appsResource().list();
		expect(appsList).toContainEqual(app);
	});

	it("should remove app", async () => {
		await appResource.remove();
		const appsList = await harness.appsResource().list();
		expect(appsList).not.toContainEqual(app);
	});
});
