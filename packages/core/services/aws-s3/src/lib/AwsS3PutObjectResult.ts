/**
 * The result of an AWS S3 put object request.
 */
export interface AwsS3PutObjectResult {
  /**
   * @param location the location of the object.
   */
  readonly location: string;
}

export class AwsS3PutObjectResult {
  constructor(public readonly location: string) {}
}
