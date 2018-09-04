import { ObjectId } from "bson";
import { UserPasswordCredential } from "mongodb-stitch-core-sdk";
import { StitchAdminClient } from "../src/index";
import { ValueCreator } from "../src/resources/ValuesResource";
import { StitchAdminClientConfiguration } from "../src/StitchAdminClientConfiguration";

describe("an app", () => {
    it("should list values", async () => {
        const config = new StitchAdminClientConfiguration.Builder().withBaseUrl(
            "http://localhost:8080"
        )
        const admin = new StitchAdminClient(config.build())

        await admin.adminAuth.loginWithCredential(
            new UserPasswordCredential("unique_user@domain.com", "password")
        )
        const appsResource = admin.apps("5a53fc1d7a2f2ead39d632d6")
        
        const apps = await appsResource.list()
        
        const app = appsResource.app(apps[0].id);
        const values = await app.values.list()

        await values.forEach(async it => { console.log(await app.values.value(it.id.toHexString()).remove()) })

        console.log(await appsResource.app(apps[0].id).values.create({
            id: new ObjectId(), name: "foo4", value: {"vname": "bar"}, private: false
        }))
        console.log(await appsResource.app(apps[0].id).values.list())
    });
});
