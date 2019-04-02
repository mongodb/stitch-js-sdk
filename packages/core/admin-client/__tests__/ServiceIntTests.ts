import { BaseStitchBrowserIntTestHarness } from "mongodb-stitch-browser-testutils";
import { AppResource, Twilio, TwilioConfig } from "../src";
import { TwilioAction, TwilioRule } from "../src/services/rules/RulesResources";

const harness = new BaseStitchBrowserIntTestHarness();

beforeAll(() => harness.setup());

describe("an app", () => {
	let appResource: AppResource;
	let service: Twilio;

	it("should add service", async() => {
		const { appResource: linkedAppResource } = await harness.createApp();
		appResource = linkedAppResource;
		
		service = await appResource.services.create(new Twilio("twilio0", new TwilioConfig("1234", "5678")));
		expect(service.name).toEqual("twilio0");
		expect(service.type).toEqual("twilio");
	});

	it("should list service", async () => {
		// configs will not come down with list
		const fetched = (await appResource.services.list())[0];
		expect(fetched.id).toEqual(service.id);
		expect(fetched.name).toEqual(service.name);
		expect(fetched.type).toEqual(service.type);
		expect(fetched.version).toEqual(service.version);
	});

	it("should fetch and update service config", async() => {
		service.config.accountSid = "abcdef"
		service.config.authToken = "ghijk";
		await appResource.services.service(service).config.update(service);
		const updatedService = await appResource.services.service(service).config.get();
		// auth token is a hidden field, so we will not care about it
		expect(service.config.accountSid).toEqual(updatedService.accountSid);
	});

	it("should add and fetch rule", async () => {
		const rule = await appResource.services.service(service).rules.create(new TwilioRule("abc", [TwilioAction.Send]));
		const fetched = await appResource.services.service(service).rules.rule(rule).get();
		expect(fetched.id).toEqual(rule.id);
		expect(fetched.name).toEqual(rule.name);
		expect(fetched.actions).toEqual(rule.actions);
	});
});
