import { StitchAppClientInfo } from "stitch-core";
import StitchService from "../StitchService";

interface NamedServiceClientProvider<T> {
    getClient(service: StitchService, client: StitchAppClientInfo): T;
}
  
export default NamedServiceClientProvider;
