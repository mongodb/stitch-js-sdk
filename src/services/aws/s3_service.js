import { serviceResponse } from '../../util';

/**
 * Convenience wrapper around AWS S3 service (not meant to be instantiated directly,
 * use `.service('aws-s3', '<service-name>')` on a {@link StitchClient} instance).
 *
 * @class
 * @return {S3Service} a S3Service instance.
 */
class S3Service {
  constructor(stitchClient, serviceName) {
    this.client = stitchClient;
    this.serviceName = serviceName;
  }

  /**
   * Put an object to S3 via Stitch. For small uploads
   *
   * @param {String} bucket which S3 bucket to use
   * @param {String} key which key (filename) to use
   * @param {String} acl which policy to apply
   * @param {String} contentType content type of uploaded data
   * @param {String|BSON.Binary} body the content to put in the bucket
   * @return {Promise} which resolves to an object containing a single field "location"
   *                   which is the URL of the object that was put into the S3 bucket
   */
  put(bucket, key, acl, contentType, body) {
    return serviceResponse(this, {
      action: 'put',
      args: { bucket, key, acl, contentType, body }
    });
  }

  /**
   * Sign a policy for putting via Stitch. For large uploads
   *
   * @param {String} bucket which S3 bucket to use
   * @param {String} key which key (filename) to use
   * @param {String} acl which policy to apply
   * @param {String} contentType content type of uploaded data
   * @return {Promise}
   */
  signPolicy(bucket, key, acl, contentType) {
    return serviceResponse(this, {
      action: 'signPolicy',
      args: { bucket, key, acl, contentType }
    });
  }
}

export default S3Service;
