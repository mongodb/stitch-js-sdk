interface Response {
  readonly statusCode: number;
  readonly headers: { [key: string]: string };
  readonly body?: string;
}

export default Response;
