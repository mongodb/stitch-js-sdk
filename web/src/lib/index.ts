import StitchAuth from "./core/auth/StitchAuth";
import StitchAuthListener from "./core/auth/StitchAuthListener";
import StitchUser from "./core/auth/StitchUser";
import Stitch from "./core/Stitch";
import StitchAppClient from "./core/StitchAppClient";
import { UserAPIKeyAuthProviderClient } from "./core/auth/providers/userapikey/UserAPIKeyAuthProviderClient";
import { UserPasswordAuthProviderClient } from "./core/auth/providers/userpassword/UserPasswordAuthProviderClient";

import { 
    StitchAppClientConfiguration, 
    AnonymousCredential, 
    CustomCredential, 
    FacebookCredential, 
    GoogleCredential, 
    ServerAPIKeyCredential, 
    UserAPIKeyCredential, 
    UserPasswordCredential,
    MemoryStorage
} from "stitch-core";

export {
    AnonymousCredential,
    CustomCredential,
    FacebookCredential,
    GoogleCredential,
    ServerAPIKeyCredential,
    UserAPIKeyCredential,
    UserPasswordCredential,
    MemoryStorage,
    Stitch,
    StitchAppClient,
    StitchAppClientConfiguration,
    StitchAuth,
    StitchAuthListener,
    StitchUser,
    UserAPIKeyAuthProviderClient,
    UserPasswordAuthProviderClient
}
