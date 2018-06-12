import { CoreStitchServiceClient, Decoder } from "stitch-core";

export default class CoreRemoteMongoReadOperation<T> {
  private readonly collectionDecoder?: Decoder<T[]>;

  constructor(
    private readonly command: string,
    private readonly args: object,
    private readonly service: CoreStitchServiceClient,
    decoder?: Decoder<T>
  ) {
    if (decoder) {
      this.collectionDecoder = new class implements Decoder<T[]> {
        public decode(from: object) {
          if (from instanceof Array) {
            return from.map(t => decoder.decode(t));
          }

          return [decoder.decode(from)];
        }
      }();
    }
  }

  public iterator(): Promise<Iterator<T>> {
    return this.executeRead().then((res: T[]) => res[Symbol.iterator]());
  }

  public first(): Promise<T | undefined> {
    return this.executeRead().then(res => res[0]);
  }

  public asArray(): Promise<T[]> {
    return this.executeRead();
  }

  private executeRead(): Promise<T[]> {
    return this.service.callFunctionInternal(
      this.command,
      [this.args],
      this.collectionDecoder
    );
  }
}
