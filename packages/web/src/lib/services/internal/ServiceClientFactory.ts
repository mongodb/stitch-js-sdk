import { StitchAppClientInfo } from "stitch-core";
import StitchServiceClient from "./StitchServiceClient";

export default interface ServiceClientFactory<T> {
  getClient(service: StitchServiceClient, client: StitchAppClientInfo): T;
}
