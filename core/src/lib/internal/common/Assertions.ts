export default class Assertions {
  /**
   * Throws an Error if the provided key does not exist in the provided object.
   */
  public static keyPresent(key: string, object: any) {
    if (object[key] === undefined) {
      throw new Error(`expected ${key} to be present`)
    }
  }
}
