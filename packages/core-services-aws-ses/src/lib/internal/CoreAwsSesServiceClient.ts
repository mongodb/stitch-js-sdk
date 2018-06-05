import { CoreStitchServiceClient } from "stitch-core";
import AwsSesSendResult from "../AwsSesSendResult";

export default class CoreAwsSesServiceClient {
    public constructor(private readonly service: CoreStitchServiceClient) {
    }
  
    public sendEmail(
        toAddress: string,
        fromAddress: string,
        subject: string,
        body: string
    ): Promise<AwsSesSendResult> {
      const args = {
          body,
          fromAddress,
          subject,
          toAddress,
      };

      return this.service.callFunctionInternal(
          "send",
          [args],
          AwsSesSendResult.Decoder
        );
    }
}
