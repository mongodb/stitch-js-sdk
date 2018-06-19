/**
 * The result of an AWS S3 sign policy request.
 */
export interface AwsS3SignPolicyResult {
  /**
   * the description of the policy that has been signed.
   */
  readonly policy: string;
  /**
   * signature the computed signature of the policy.
   */
  readonly signature: string;
  /**
   * algorithm the algorithm used to compute the signature.
   */
  readonly algorithm: string;
  /**
   * date the date at which the signature was computed.
   */
  readonly date: string;
  /**
   * credential the credential that should be used when utilizing this signed policy.
   */
  readonly credential: string;
}

export class AwsS3SignPolicyResult {
  constructor(
    public readonly policy: string,
    public readonly signature: string,
    public readonly algorithm: string,
    public readonly date: string,
    public readonly credential: string
  ) {}
}
