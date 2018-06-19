import { Decoder } from "mongodb-stitch-core-sdk";

enum Fields {
  MessageId = "messageId"
}

/**
 * The result of an AWS SES send request.
 */
export default class AwsSesSendResult {
  public static readonly Decoder = new class
    implements Decoder<AwsSesSendResult> {
    public decode(from: object): AwsSesSendResult {
      return { messageId: from[Fields.MessageId] };
    }
  }();

  /**
   * Constructs a result.
   * @param messageId the id of the sent message.
   */
  public constructor(public readonly messageId: string) {}
}
