import { StitchAppClientInfo } from "stitch-core";
import { AwsSesSendResult, CoreAwsSesServiceClient } from "stitch-core-services-aws-ses";
import { NamedServiceClientFactory, StitchServiceClient } from "stitch-web";
import AwsSesServiceClientImpl from "./internal/AwsSesServiceClientImpl";

/**
 * The AWS SES service client.
 */
export interface AwsSesServiceClient {

    /**
     * Sends an email.
     *
     * @param to the email address to send the email to.
     * @param from the email address to send the email from.
     * @param subject the subject of the email.
     * @param body the body text of the email.
     * @return a task containing the result of the send that completes when the send is done.
     */
    sendEmail(
        to: string,
        from: string,
        subject: string,
        body: string): Promise<AwsSesSendResult>;
  }
  
  class AwsSesServiceClientFactory implements NamedServiceClientFactory<AwsSesServiceClient> {
    public getClient(service: StitchServiceClient, appInfo: StitchAppClientInfo) {
        return new AwsSesServiceClientImpl(new CoreAwsSesServiceClient(service));
    }
  }

export class AwsSesService {
    public static Factory: NamedServiceClientFactory<AwsSesServiceClient> = new AwsSesServiceClientFactory();
}