import DB from './db';

/**
 * Create a new MongoDBService instance (not meant to be instantiated directly).
 *
 * @class
 * @return {MongoDBService} a MongoDBService instance.
 */
class MongoDBService {
  constructor(stitchClient, serviceName) {
    this.stitchClient = stitchClient;
    this.serviceName = serviceName;
  }

  /**
   * Get a DB instance
   *
   * @method
   * @param {String} databaseName The MongoDB database name
   * @param {Object} [options] Additional options.
   * @return {DB} returns a DB instance representing a MongoDB database.
   */
  db(databaseName, options = {}) {
    return new DB(this.stitchClient, this.serviceName, databaseName);
  }
}


export default MongoDBService;
