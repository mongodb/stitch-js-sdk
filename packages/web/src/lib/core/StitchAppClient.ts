import NamedServiceClientFactory from "../services/internal/NamedServiceClientFactory";
import ServiceClientFactory from "../services/internal/ServiceClientFactory";
import StitchAuth from "./auth/StitchAuth";

export default interface StitchAppClient {
  auth: StitchAuth;

  getServiceClientWithName<T>(
    provider: NamedServiceClientFactory<T>,
    serviceName: string
  ): T;

  getServiceClient<T>(provider: ServiceClientFactory<T>): T;

  callFunction(name: string, args: any[]): Promise<any>;
}
