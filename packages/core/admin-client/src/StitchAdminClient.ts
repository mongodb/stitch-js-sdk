import {
  FetchTransport,
  MemoryStorage,
  Method,
  StitchAuthRequest,
  StitchCredential,
  StitchRequestClient,
  Transport
} from "mongodb-stitch-core-sdk";
import { Apps } from "./Resources";
import StitchAdminAuth from "./StitchAdminAuth";
import StitchAdminAuthRoutes from "./StitchAdminAuthRoutes";
import { StitchAdminUser } from "./StitchAdminUser";
import {
  StitchAdminUserProfile,
  StitchAdminUserProfileCodec
} from "./StitchAdminUserProfile";

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
    const requestClient = new StitchRequestClient(baseUrl, transport);

    this.authRoutes = new StitchAdminAuthRoutes();

    this.adminAuth = new StitchAdminAuth(
      requestClient,
      this.authRoutes,
      new MemoryStorage("<admin>")
    );
  }

  public adminProfile(): Promise<StitchAdminUserProfile> {
    const req = new StitchAuthRequest.Builder()
      .withMethod(Method.GET)
      .withPath(this.authRoutes.profileRoute)
      .build();

    return this.adminAuth.doAuthenticatedRequestWithDecoder(
      req,
      new StitchAdminUserProfileCodec()
    );
  }

  public apps(groupId: string): Apps {
    return new Apps(
      this.adminAuth,
      `${StitchAdminClient.apiPath}/groups/${groupId}/apps`
    );
  }

  public loginWithCredential(
    credential: StitchCredential
  ): Promise<StitchAdminUser> {
    return this.adminAuth.loginWithCredentialInternal(credential);
  }

  public logout(): Promise<void> {
    return this.adminAuth.logoutInternal();
  }
}
