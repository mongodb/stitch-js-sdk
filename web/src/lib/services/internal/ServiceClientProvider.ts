import { StitchAppClientInfo } from "stitch-core";
import StitchService from "../StitchService";

interface ServiceClientProvider<T> {
  getClient(service: StitchService, client: StitchAppClientInfo): T;
}

export default ServiceClientProvider;
