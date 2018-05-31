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
import {
  StitchAdminUserProfile,
  StitchAdminUserProfileCodec
} from "./StitchAdminUserProfile";
import Transport from "../../../core/dist/internal/net/Transport";
import { Apps } from "./Resources";
import { StitchAdminUser } from "./StitchAdminUser";

export default class StitchAdminClient {
  public static readonly apiPath = "/api/admin/v3.0";
  public static readonly defaultServerUrl = "http://localhost:9090";
  public static readonly defaultRequestTimeout = 15.0;

  private readonly adminAuth: StitchAdminAuth;
  private readonly authRoutes: StitchAdminAuthRoutes;

  public constructor(
    baseUrl: string = StitchAdminClient.defaultServerUrl,
    transport: Transport = new FetchTransport(),
    requestTimeout: number = StitchAdminClient.defaultRequestTimeout
  ) {
    let requestClient = StitchRequestClientImpl(
      baseUrl,
      transport,
      requestTimeout
    );

    this.authRoutes = new StitchAdminAuthRoutes();

    this.adminAuth = new StitchAdminAuth(
      requestClient,
      this.authRoutes,
      MemoryStorage()
    );
  }

  public adminProfile(): Promise<StitchAdminUserProfile> {
    let req = StitchAuthRequest.Builder()
      .withMethod(Method.GET)
      .withPath(this.authRoutes.profileRoute)
      .build();

    return this.adminAuth.doAuthenticatedJSONRequest(
      req,
      new StitchAdminUserProfileCodec()
    );
  }

  public apps(groupId: String): Apps {
    return new Apps(
      this.adminAuth,
      `${StitchAdminClient.apiPath}/groups/${groupId}/apps`
    );
  }

  public loginWithCredential(credential: StitchCredential): StitchAdminUser {
    return this.adminAuth.loginWithCredentialInternal(credential);
  }

  public logout() {
    return this.adminAuth.logoutInternal();
  }
}
