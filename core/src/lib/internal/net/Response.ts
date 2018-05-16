interface Response {
  readonly statusCode: number;
  readonly headers: { [key: string]: string };
  readonly body: any;
}

export default Response;
