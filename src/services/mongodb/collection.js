import { deprecate } from '../../util';
import { BSON } from 'mongodb-extjson';
const { ObjectID } = BSON;

/**
 * Create a new Collection instance (not meant to be instantiated directly).
 *
 * @class
 * @return {Collection} a Collection instance.
 */
export default class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  /**
   * Insert a single document
   *
   * @method
   * @param {Object} doc The document to insert.
   * @param {Object} [options] Additional options object.
   * @return {Promise<Object, Error>} a Promise for the operation.
   */
  insertOne(doc, options = {}) {
    return this.insertMany(doc, options);
  }

  /**
   * Insert multiple documents
   *
   * @method
   * @param {Array} docs The documents to insert.
   * @param {Object} [options] Additional options object.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  insertMany(docs) {
    docs = Array.isArray(docs) ? docs : [ docs ];

    // add ObjectIds to docs that have none
    docs = docs.map(doc => {
      if (doc._id === undefined) doc._id = new ObjectID();
      return doc;
    });

    return this.db.client.executePipeline([
      {
        action: 'literal',
        args: {
          items: docs
        }
      },
      {
        service: this.db.service,
        action: 'insert',
        args: {
          database: this.db.name,
          collection: this.name
        }
      }
    ]);
  }

  /**
   * Update a single document
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
   * Update multiple documents
   *
   * @method
   * @param {Object} query The query used to match the documents.
   * @param {Object} update The update operations to perform on the matching documents.
   * @param {Object} [options] Additional options object.
   * @param {Boolean} [options.upsert=false] Perform an upsert operation.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  updateMany(query, update, upsert, multi) {
    return updateOp(this, query, update, Object.assign({}, options, { multi: true }));
  }

  /**
   * Delete a single document
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
   * Delete all documents matching query
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
   * Find documents
   *
   * @method
   * @param {Object} query The query used to match the first document.
   * @param {Object} [options] Additional options object.
   * @param {Object} [options.project=null] The query document projection.
   * @return {Array} An array of documents.
   */
  find(query, options = {}) {
    const args = Object.assign({
      database: this.db.name,
      collection: this.name
    }, options);

    return this.db.client.executePipeline([
      {
        service: this.db.service,
        action: 'find',
        args: args
      }
    ]);
  }

  // deprecated
  insert(docs, options = {}) {
    return this.insertMany(docs, options);
  }

  upsert(query, update, options = {}) {
    return updateOp(this, query, update, Object.assign({}, options, { upsert: true }));
  }
}

// deprecated methods
Collection.prototype.upsert =
  deprecate(Collection.prototype.upsert, 'use `updateOne`/`updateMany` instead of `upsert`');

// private
function deleteOp(self, query, options) {
  const args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query
  }, options);

  return self.db.client.executePipeline([
    {
      service: self.db.service,
      action: 'delete',
      args: args
    }
  ]);
}

function updateOp(self, query, update, options) {
  const args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query,
    update: update
  }, options);

  return self.db.client.executePipeline([
    {
      service: self.db.service,
      action: 'update',
      args: args
    }
  ]);
}
