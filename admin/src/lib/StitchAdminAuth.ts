import { CoreStitchAuth, StitchUserFactory, DeviceFields, StitchRequestClient, StitchAuthRoutes, Storage } from "stitch-core";
import { StitchAdminUser, StitchAdminUserFactory } from "./StitchAdminUser";

/**
 * A special implementation of CoreStitchAuth that communicates with the MongoDB Stitch Admin API.
 */
export default class StitchAdminAuth extends CoreStitchAuth<StitchAdminUser> {
    public get userFactory(): StitchUserFactory<StitchAdminUser> {
        return new StitchAdminUserFactory();
    }

    public get deviceInfo(): { [key: string]: string } {
        var info = {};

        if (this.hasDeviceId) {
            info[DeviceFields.DEVICE_ID] = this.deviceId
        }

        info[DeviceFields.APP_ID] = "MongoDB Stitch Swift Admin Client"

        return info
    }

    public constructor(requestClient: StitchRequestClient, authRoutes: StitchAuthRoutes, storage: Storage) {
        super(requestClient, authRoutes, storage);
    }

    public onAuthEvent() {
        // do nothing
    }
}
