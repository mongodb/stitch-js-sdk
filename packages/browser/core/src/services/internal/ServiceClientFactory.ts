import { StitchAppClientInfo } from "mongodb-stitch-core-sdk";
import StitchServiceClient from "./StitchServiceClient";

export default interface ServiceClientFactory<T> {
  getClient(service: StitchServiceClient, client: StitchAppClientInfo): T;
}
