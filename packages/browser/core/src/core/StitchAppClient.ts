import NamedServiceClientFactory from "../services/internal/NamedServiceClientFactory";
import ServiceClientFactory from "../services/internal/ServiceClientFactory";
import StitchAuth from "./auth/StitchAuth";

export default interface StitchAppClient {
  auth: StitchAuth;

  getServiceClient<T>(
    factory: NamedServiceClientFactory<T>,
    serviceName: string
  ): T;

  getServiceClient<T>(factory: ServiceClientFactory<T>): T;

  callFunction(name: string, args: any[]): Promise<any>;
}
