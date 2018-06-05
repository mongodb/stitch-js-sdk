import { AwsSesSendResult, CoreAwsSesServiceClient } from "stitch-core-services-aws-ses";
import { AwsSesServiceClient } from "../AwsSesServiceClient";

export default class AwsSesServiceClientImpl implements AwsSesServiceClient {
    public constructor(
        private readonly proxy: CoreAwsSesServiceClient,
    ) {
    }
  
    /**
     * Sends an email.
     *
     * @param to the email address to send the email to.
     * @param from the email address to send the email from.
     * @param subject the subject of the email.
     * @return a task containing the result of the send that completes when the send is done.
     */
    public sendEmail(
        to: string,
        from: string,
        subject: string,
        body: string): Promise<AwsSesSendResult> {
      return this.proxy.sendEmail(to, from, subject, body);
    }
  }
  