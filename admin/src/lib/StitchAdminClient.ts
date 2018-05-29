import { 
    FetchTransport,
    StitchRequestClientImpl,
    StitchAuthRequest,
    Method,
    MemoryStorage,
    StitchCredential
} from "stitch-core";
import StitchAdminAuth from "./StitchAdminAuth";
import StitchAdminAuthRoutes from "./StitchAdminAuthRoutes";
import { StitchAdminUserProfile } from "./StitchAdminUserProfile";

export default class StitchAdminClient {
    public static readonly apiPath = "/api/admin/v3.0"
    public static readonly defaultServerUrl = "http://localhost:9090"
    public static readonly defaultRequestTimeout = 15.0

    private readonly adminAuth: StitchAdminAuth
    private readonly authRoutes: StitchAdminAuthRoutes

    public constructor(baseUrl: string = StitchAdminClient.defaultServerUrl,
                        transport: Transport = new FetchTransport(),
                        requestTimeout: number = StitchAdminClient.defaultRequestTimeout) {
        let requestClient = StitchRequestClientImpl(baseUrl,
                                                    transport,
                                                    requestTimeout);

        this.authRoutes = new StitchAdminAuthRoutes();

        this.adminAuth = new StitchAdminAuth(
            requestClient,
            this.authRoutes,
            MemoryStorage()
        );
    }

    public adminProfile(): StitchAdminUserProfile {
        let req = StitchAuthRequest.Builder()
            .withMethod(Method.GET)
            .withPath(this.authRoutes.profileRoute)
            .build();

        let response = this.adminAuth.doAuthenticatedRequest(req)

        if (response.body === undefined) {
            throw StitchError.serviceError(withMessage: "empty response", withServiceErrorCode: .unknown)
        }

        return try JSONDecoder().decode(StitchAdminUserProfile.self, response.body)
    }

    public apps(groupId: String): Apps {
        return Apps(this.adminAuth, `${apiPath}/groups/${groupId}/apps`)
    }

    public loginWithCredential(credential: StitchCredential): StitchAdminUser {
        return this.adminAuth.loginWithCredentialBlocking(credential)
    }

    public logout() {
        return this.adminAuth.logoutBlocking()
    }
}
