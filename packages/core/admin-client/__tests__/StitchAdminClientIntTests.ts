import { ObjectId } from "bson";
import { UserPasswordCredential } from "mongodb-stitch-core-sdk";
import { ProviderConfigCodec, Userpass } from "../src/configs/AuthProviderConfigs";
import { AppResource, AppResponse, AppsResource, StitchAdminClient, AwsS3, AwsS3RuleCreator, AwsS3Actions } from "../src/index";
import { StitchAdminClientConfiguration } from "../src/StitchAdminClientConfiguration";

async function createApp(): Promise<AppResponse> {
    return appsResource.create({name: "fun-app"})
}

const config = new StitchAdminClientConfiguration.Builder().withBaseUrl(
    "http://localhost:9090"
)
const admin = new StitchAdminClient(config.build())
const appsResource = admin.apps("5a53fc1d7a2f2ead39d632d6")
let app: AppResponse;

describe("an app", () => {
    it("should create an app", async () => {
        await admin.adminAuth.loginWithCredential(
            new UserPasswordCredential("unique_user@domain.com", "password")
        )

        app = await createApp();

        expect(app.clientAppId).toContain("fun-app");
        expect(app.id).toBeDefined();
        expect(app.name).toEqual("fun-app");
    });

    it("should create, get, disable, enable auth providers", async () => {
        const appResource = appsResource.app(app.id);
        let authProviderResponse = await appResource.authProviders.create(new Userpass(
            "http://testEmailConfirmationUrl.com", "http://resetPasswordUrl.com", "confirm email", "reset password"
        ))

        expect(authProviderResponse.name).toEqual("local-userpass")
        expect(authProviderResponse.type).toEqual("local-userpass")
        expect(authProviderResponse.disabled).toBeFalsy();
        expect(authProviderResponse.id).toBeDefined();

        await appResource.authProviders.authProvider(authProviderResponse.id).disable();

        authProviderResponse = await appResource.authProviders.authProvider(authProviderResponse.id).get();
        
        expect(authProviderResponse.name).toEqual("local-userpass");
        expect(authProviderResponse.type).toEqual("local-userpass");
        expect(authProviderResponse.disabled).toBeTruthy();
        expect(authProviderResponse.id).toBeDefined();

        await appResource.authProviders.authProvider(authProviderResponse.id).enable();

        authProviderResponse = await appResource.authProviders.authProvider(authProviderResponse.id).get();
        
        expect(authProviderResponse.name).toEqual("local-userpass");
        expect(authProviderResponse.type).toEqual("local-userpass");
        expect(authProviderResponse.disabled).toBeFalsy();
        expect(authProviderResponse.id).toBeDefined();
    });

    it("should create, get, update functions", async () => {
        const appResource = appsResource.app(app.id);
        let functionResponse = await appResource.functions.create({
            canEvaluate: true,
            name: "fun function",
            private: false,
            source: "const foo = 'bar';"
        })

        expect(functionResponse.name).toEqual("fun function");
        expect(functionResponse.id).toBeDefined();

        functionResponse = await appResource.functions.function(functionResponse.id).get();

        expect(functionResponse.canEvaluate).toBeTruthy()
        expect(functionResponse.private).toBeFalsy();
        expect(functionResponse.name).toEqual("fun function");
        expect(functionResponse.source).toEqual("const foo = 'bar';")
        expect(functionResponse.id).toBeDefined();

        await appResource.functions.function(functionResponse.id).update(
            { canEvaluate: false, private: true, name: "not fun function", source: "const bar = 'foo';" }
        );

        functionResponse = await appResource.functions.function(functionResponse.id).get();

        expect(functionResponse.canEvaluate).toBeFalsy()
        expect(functionResponse.private).toBeTruthy();
        expect(functionResponse.name).toEqual("not fun function");
        expect(functionResponse.source).toEqual("const bar = 'foo';")
        expect(functionResponse.id).toBeDefined();
    });

    it("should create, get, update services", async () => {
        const appResource = appsResource.app(app.id);
        let serviceResponse = await appResource.services.create(new AwsS3(
            "fun-aws", 
            {region: "northeast", accessKeyId: "aki", secretAccessKey: "sak"},
        ))

        expect(serviceResponse.name).toEqual("fun-aws");
        expect(serviceResponse.id).toBeDefined();
        expect(serviceResponse.type).toEqual("aws-s3")

        serviceResponse = await appResource.services.service(serviceResponse.id).get();

        expect(serviceResponse.name).toEqual("fun-aws");
        expect(serviceResponse.id).toBeDefined();
        expect(serviceResponse.type).toEqual("aws-s3")

        const ruleResponse = await appResource.services.service(serviceResponse.id).rules.create(
            new AwsS3RuleCreator("rule1", [AwsS3Actions.Put])
        )
    });
});
