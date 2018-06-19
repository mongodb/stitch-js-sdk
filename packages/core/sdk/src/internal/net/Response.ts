export default class Response {
  public readonly headers: { [key: string]: string } = {};

  constructor(
    headers: { [key: string]: string },
    public readonly statusCode: number,
    public readonly body?: string
  ) {
    // preprocess headers
    Object.keys(headers).map((key, index) => {
      this.headers[key.toLocaleLowerCase()] = headers[key];
    });
  }
}
