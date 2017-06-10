import { deprecate, serviceResponse, letMixin } from '../../util';
import { BSON } from 'mongodb-extjson';
const { ObjectID } = BSON;

/**
 * Create a new Collection instance (not meant to be instantiated directly).
 *
 * @class
 * @return {Collection} a Collection instance.
 */
class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  /**
   * Inserts a single document.
   *
   * @method
   * @param {Object} doc The document to insert.
   * @param {Object} [options] Additional options object.
   * @return {Promise<Object, Error>} a Promise for the operation.
   */
  insertOne(doc, options = {}) {
    return insertOp(this, doc, options);
  }

  /**
   * Inserts multiple documents.
   *
   * @method
   * @param {Array} docs The documents to insert.
   * @param {Object} [options] Additional options object.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  insertMany(docs, options = {}) {
    return insertOp(this, docs, options);
  }

  /**
   * Deletes a single document.
   *
   * @method
   * @param {Object} query The query used to match a single document.
   * @param {Object} [options] Additional options object.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  deleteOne(query, options = {}) {
    return deleteOp(this, query, Object.assign({}, options, { singleDoc: true }));
  }

  /**
   * Deletes all documents matching query.
   *
   * @method
   * @param {Object} query The query used to match the documents to delete.
   * @param {Object} [options] Additional options object.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  deleteMany(query, options = {}) {
    return deleteOp(this, query, Object.assign({}, options, { singleDoc: false }));
  }

  /**
   * Updates a single document.
   *
   * @method
   * @param {Object} query The query used to match a single document.
   * @param {Object} update The update operations to perform on the matching document.
   * @param {Object} [options] Additional options object.
   * @param {Boolean} [options.upsert=false] Perform an upsert operation.
   * @return {Promise<Object, Error>} A Promise for the operation.
   */
  updateOne(query, update, options = {}) {
    return updateOp(this, query, update, Object.assign({}, options, { multi: false }));
  }

  /**
   * Updates multiple documents.
   *
   * @method
   * @param {Object} query The query used to match the documents.
   * @param {Object} update The update operations to perform on the matching documents.
   * @param {Object} [options] Additional options object.
   * @param {Boolean} [options.upsert=false] Perform an upsert operation.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  updateMany(query, update, options = {}) {
    return updateOp(this, query, update, Object.assign({}, options, { multi: true }));
  }

  /**
   * Finds documents.
   *
   * @method
   * @param {Object} query The query used to match documents.
   * @param {Object} [options] Additional options object.
   * @param {Object} [options.projection=null] The query document projection.
   * @param {Number} [options.limit=null] The maximum number of documents to return.
   * @return {Array} An array of documents.
   */
  find(query, options = {}) {
    return findOp(this, query, options);
  }

  /**
   * Gets the number of documents matching the filter.
   *
   * @param {Object} query The query used to match documents.
   * @param {Object} options Additional find options.
   * @param {Number} [options.limit=null] The maximum number of documents to return.
   * @return {Number} An array of documents.
   */
  count(query, options = {}) {
    return findOp(this, query, Object.assign({}, options, {
      count: true
    }), result => !!result.result ? result.result[0] : 0);
  }

  // deprecated
  insert(docs, options = {}) {
    return insertOp(this, docs, options);
  }

  upsert(query, update, options = {}) {
    return updateOp(this, query, update, Object.assign({}, options, { upsert: true }));
  }
}

// deprecated methods
Collection.prototype.upsert =
  deprecate(Collection.prototype.upsert, 'use `updateOne`/`updateMany` instead of `upsert`');

// private
function insertOp(self, docs, options) {
  let stages = [];

  // there may be no docs, when building for chained pipeline stages in
  // which case the source is considered to be the previous stage
  if (docs) {
    docs = Array.isArray(docs) ? docs : [ docs ];

    // add ObjectIds to docs that have none
    docs = docs.map(doc => {
      if (doc._id === undefined || doc._id === null) doc._id = new ObjectID();
      return doc;
    });

    stages.push({
      action: 'literal',
      args: {
        items: docs
      }
    });
  }

  stages.push({
    service: self.db.service,
    action: 'insert',
    args: {
      database: self.db.name,
      collection: self.name
    }
  });

  return serviceResponse(self.db, stages, response => {
    return {
      insertedIds: response.result.map(doc => doc._id)
    };
  });
}

function deleteOp(self, query, options) {
  const args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query
  }, options);

  return serviceResponse(self.db, {
    service: self.db.service,
    action: 'delete',
    args: args
  }, response => {
    return {
      deletedCount: response.result[0].removed
    };
  });
}

function updateOp(self, query, update, options) {
  const args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query,
    update: update
  }, options);

  return serviceResponse(self.db, {
    service: self.db.service,
    action: 'update',
    args: args
  });
}

function findOp(self, query, options, finalizer) {
  finalizer = finalizer || ((response) => response.result);
  const args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query
  }, options);

  // legacy argument naming
  if (args.projection) {
    args.project = args.projection;
    delete args.projection;
  }

  return serviceResponse(self.db, {
    service: self.db.service,
    action: 'find',
    args: args
  }, finalizer);
}

export default letMixin(Collection);
