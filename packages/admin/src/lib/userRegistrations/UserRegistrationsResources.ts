import { Codec } from "stitch-core";

enum Fields {
  Token = "token",
  TokenId = "token_id"
}

// Class that allows the retrieval of the token
// and tokenId of a confirmation email, for the sake
// of skirting email registration
export interface ConfirmationEmail {
  readonly token: string;
  readonly tokenId: string;
}

export class ConfirmationEmailCodec implements Codec<ConfirmationEmail> {
  public decode(from: object): ConfirmationEmail {
    return {
      token: from[Fields.Token],
      tokenId: from[Fields.TokenId]
    };
  }

  public encode(from: ConfirmationEmail): object {
    return {
      [Fields.Token]: from.token,
      [Fields.TokenId]: from.tokenId
    };
  }
}
