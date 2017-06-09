import { serviceResponse, letMixin } from '../../util';

/**
 * Convenience wrapper around AWS S3 service (not meant to be instantiated directly).
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
   * NOTE: body must be a pipeline stream
   *
   * @param {String} bucket which S3 bucket to use
   * @param {String} key which key (filename) to use
   * @param {String} acl which policy to apply
   * @param {String} contentType content type of uploaded data
   * @return {Promise}
   */
  put(bucket, key, acl, contentType) {
    return serviceResponse(this, {
      service: this.serviceName,
      action: 'put',
      args: { bucket, key, acl, contentType }
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
      service: this.serviceName,
      action: 'signPolicy',
      args: { bucket, key, acl, contentType }
    });
  }
}

export default letMixin(S3Service);
