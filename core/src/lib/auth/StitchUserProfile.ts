/**
 * The set of properties that describe a MongoDB Stitch user.
 */
interface StitchUserProfile {
  /**
   * The full name of the user.
   */
  readonly name?: string;

  /**
   * The email address of the user.
   */
  readonly email?: string;

  /**
   * A URL to the user's profile picture.
   */
  readonly pictureURL?: string;

  /**
   * The first name of the user.
   */
  readonly firstName?: string;

  /**
   * The last name of the user.
   */
  readonly lastName?: string;

  /**
   * The gender of the user.
   */
  readonly gender?: string;

  /**
   * The birthdate of the user.
   */
  readonly birthday?: string;

  /**
   * The minimum age of the user.
   */
  readonly minAge?: number;

  /**
   * The maximum age of the user.
   */
  readonly maxAge?: number;
}

export default StitchUserProfile;
