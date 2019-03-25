import { BSON, UserPasswordCredential } from "mongodb-stitch-core-sdk";
import { App, AppResource, StitchAdminClient } from "../src";
import { AuthProviderResource } from "../src/authProviders/AuthProvidersResources";
import { UserpassProvider, UserpassProviderConfig } from "../src/authProviders/ProviderConfigs";
import AdminClientTestHarness from "./AdminClientTestHarness";

const harness = new AdminClientTestHarness();

beforeAll(() => harness.setup());

describe("an app", () => {
	let authProvider: AuthProviderResource<UserpassProvider>;
	const config = new UserpassProviderConfig(
		"http://foo.com",
		"http://bar.com",
		"baz",
		"qux"
	)

	let provider: UserpassProvider = new UserpassProvider(config);
	it("should add auth provider", async () => {
		const authProviderResponse = await harness.appResource.authProviders.create(provider);

		expect(authProviderResponse.name).toEqual(provider.type);
		expect(authProviderResponse.type).toEqual(provider.type);
		expect(authProviderResponse.id).toBeDefined();
		expect(authProviderResponse.disabled).toBeFalsy();

		authProvider = harness.appResource.authProviders.authProvider(authProviderResponse);
	});

	it("should enable/disable auth provider", async () => {
		await authProvider.disable();
		provider = await authProvider.get();

		expect(provider.disabled).toBeTruthy();

		await authProvider.enable();

		provider = await authProvider.get();

		expect(provider.disabled).toBeFalsy();
	});

	it("should update auth provider", async () => {
		provider.config.emailConfirmationUrl = "http://woof.com"

		await authProvider.update(provider);

		provider = await authProvider.get();
		
		expect(provider.config.emailConfirmationUrl).toEqual("http://woof.com");
	});

	it("should remove auth provider", async () => {
		expect(await harness.appResource.authProviders.list()).toHaveLength(2);
		await authProvider.disable();
		await authProvider.remove();
		expect(await harness.appResource.authProviders.list()).toHaveLength(1);
	});
});