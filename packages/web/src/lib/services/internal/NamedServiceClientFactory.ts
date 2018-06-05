import { StitchAppClientInfo } from "stitch-core";
import StitchServiceClient from "./StitchServiceClient";

export default interface NamedServiceClientFactory<T> {
  getClient(service: StitchServiceClient, client: StitchAppClientInfo): T;
}
