import { CoreStitchServiceClient } from "stitch-core";

export default class CoreTwilioServiceClient {
  public constructor(private readonly service: CoreStitchServiceClient) {}

  public sendMessage(
    to: string,
    from: string,
    body: string,
    mediaUrl?: string
  ): Promise<void> {
    const args = {
      body,
      from,
      to
    };

    if (mediaUrl !== undefined) {
      args["mediaUrl"] = mediaUrl;
    }

    return this.service.callFunctionInternal("send", [args]);
  }
}
