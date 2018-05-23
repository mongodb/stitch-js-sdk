import Assertions from "../../../../internal/common/Assertions";

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
  public readonly id: string

  /**
   * The actual key. Will only be included in the response when an API key is first created.
   */
  public readonly key?: string

  /**
   * The name of the key.
   */
  public readonly name: string

  /**
   * Whether or not the key is disabled.
   */
  public readonly disabled: boolean

  /**
   * Decodes a response from the Stitch client API into a User API key.
   * 
   * @param body The body of the response from the Stitch client API
   */
  public static readFromAPI(bodyText: string): UserAPIKey {
    const body = JSON.parse(bodyText)
    Assertions.keyPresent(Fields.ID, body)
    Assertions.keyPresent(Fields.NAME, body)
    Assertions.keyPresent(Fields.DISABLED, body)
    return new UserAPIKey(
      body[Fields.ID],
      body[Fields.KEY],
      body[Fields.NAME],
      body[Fields.DISABLED]
    )
  }

  protected constructor(
    id: string,
    key: string | undefined,
    name: string,
    disabled: boolean
  ) {
    this.id = id
    this.key = key
    this.name = name
    this.disabled = disabled
  }
}
