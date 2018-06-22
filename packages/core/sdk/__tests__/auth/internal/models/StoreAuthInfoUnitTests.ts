import { StoreAuthInfo } from "../../../../src/auth/internal/models/StoreAuthInfo";
import StoreCoreUserProfile from "../../../../src/auth/internal/models/StoreCoreUserProfile";
import StoreStitchUserIdentity from "../../../../src/auth/internal/models/StoreStitchUserIdentity";

describe("StoreAuthInfo, StoreCoreUserProfile, and StoreStitchUserIdentity", () => {
    it("should encode and decode", () => {
        const originalAuthInfo = new StoreAuthInfo(
            "dummy_user_id",
            "dummy_device_id",
            "dummy_access_token",
            "dummy_refresh_token",
            "dummy_logged_in_provider_type",
            "dummy_logged_in_provider_name",
            new StoreCoreUserProfile(
                "dummy_user_type",
                { "dummy_key": "dummy_value" },
                [new StoreStitchUserIdentity("dummy_id", "dummy_provider_type")]
            )
        );

        const encoded = originalAuthInfo.encode();

        const expectedEncoded = {
            "access_token": "dummy_access_token",
            "device_id": "dummy_device_id",
            "logged_in_provider_name": "dummy_logged_in_provider_name",
            "logged_in_provider_type": "dummy_logged_in_provider_type",
            "refresh_token": "dummy_refresh_token",
            "user_id": "dummy_user_id",
            "user_profile": {
                "data": { "dummy_key": "dummy_value" },
                "identities": [{"id": "dummy_id", "provider_type": "dummy_provider_type"}],
                "type": "dummy_user_type"
            }
        }

        expect(encoded).toEqual(expectedEncoded);

        expect(originalAuthInfo).toEqual(StoreAuthInfo.decode(encoded));
    })
})
