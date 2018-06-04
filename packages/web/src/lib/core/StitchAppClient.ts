import NamedServiceClientProvider from "../services/internal/NamedServiceClientProvider";
import ServiceClientProvider from "../services/internal/ServiceClientProvider";
import StitchAuth from "./auth/StitchAuth";

interface StitchAppClient {
  auth: StitchAuth;

  getServiceClientWithName<T>(
    provider: NamedServiceClientProvider<T>,
    serviceName: string
  ): T;

  getServiceClient<T>(provider: ServiceClientProvider<T>): T;

  callFunction(name: string, args: any[]): Promise<any>;
}

export default StitchAppClient;
