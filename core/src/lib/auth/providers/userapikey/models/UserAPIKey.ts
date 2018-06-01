import Assertions from "../../../../internal/common/Assertions";
import { ObjectID } from "bson";

enum Fields {
  ID = "_id",
  KEY = "key",
  NAME = "name",
  DISABLED = "disabled"
}

/**
 * A class containing the fields returned by the Stitch client API in an authentication request.
 */
export default class UserAPIKey {
  /**
   * The id of the key.
   */
  public readonly id: ObjectID;

  /**
   * The actual key. Will only be included in the response when an API key is first created.
   */
  public readonly key?: string;

  /**
   * The name of the key.
   */
  public readonly name: string;

  /**
   * Whether or not the key is disabled.
   */
  public readonly disabled: boolean;

  /**
   * Decodes a response from the Stitch client API into a User API key.
   *
   * @param body The body of the response from the Stitch client API
   */
  public static readFromAPI(json: string | object): UserAPIKey {
    var body = typeof json === "string" ? JSON.parse(json) : json;

    Assertions.keyPresent(Fields.ID, body);
    Assertions.keyPresent(Fields.NAME, body);
    Assertions.keyPresent(Fields.DISABLED, body);
    return new UserAPIKey(
      body[Fields.ID],
      body[Fields.KEY],
      body[Fields.NAME],
      body[Fields.DISABLED]
    );
  }

  public constructor(
    id: string,
    key: string | undefined,
    name: string,
    disabled: boolean
  ) {
    this.id = ObjectID.createFromHexString(id);
    this.key = key;
    this.name = name;
    this.disabled = disabled;
  }

  public toJSON(): object {
    return {
      [Fields.ID]: this.id,
      [Fields.KEY]: this.key,
      [Fields.NAME]: this.name,
      [Fields.DISABLED]: this.disabled
    };
  }
}
