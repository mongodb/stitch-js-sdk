export default class Assertions {
  /**
   * Throw IllegalStateException if key is not present in map.
   * @param key the key to expect.
   * @param map the map to search.
   * @throws IllegalArgumentException if key is not in map.
   */
  public static keyPresent(key: string, object: any) {
    if (object[key] === undefined) {
      throw new Error(`expected ${key} to be present`)
    }
  }
}
