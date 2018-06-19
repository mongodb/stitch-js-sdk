import CoreTwilioServiceClient from "mongodb-stitch-core-services-twilio";
import { TwilioServiceClient } from "../TwilioServiceClient";

export default class TwilioServiceClientImpl implements TwilioServiceClient {
  public constructor(private readonly proxy: CoreTwilioServiceClient) {}
  /**
   * Sends an SMS/MMS message.
   *
   * @param to the number to send the message to.
   * @param from the number that the message is from.
   * @param body the body text of the message.
   * @param mediaUrl the URL of the media to send in an MMS.
   * @return a task that completes when the send is done.
   */
  public sendMessage(
    to: string,
    from: string,
    body: string,
    mediaUrl?: string
  ): Promise<void> {
    return this.proxy.sendMessage(to, from, body, mediaUrl);
  }
}
