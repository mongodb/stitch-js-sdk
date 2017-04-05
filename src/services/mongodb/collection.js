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

  getBaseArgs() {
    return {
      'database': this.db.name,
      'collection': this.name
    };
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
        'action': 'literal',
        'args': {
          'items': docs
        }
      },
      {
        'service': this.db.service,
        'action': 'insert',
        'args': this.getBaseArgs()
      }
    ]);
  }

  // deprecated
  insert(docs) {
    return this.insertMany(docs);
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
  updateOne(query, update) {
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, false)]);
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
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, false, true)]);
  }

  // deprecated
  upsert(query, update) {
    return this.db.client.executePipeline([this.makeUpdateStage(query, update, true, false)]);
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
   * <TBD wrt cursors>
   *
   * @method
   * @param {Object} query The query used to match the first document.
   * @return {Array} An array of documents.
   */
  find(query, project) {
    let args = this.getBaseArgs();
    args.query = query;
    args.project = project;
    return this.db.client.executePipeline([
      {
        'service': this.db.service,
        'action': 'find',
        'args': args
      }
    ]);
  }

  makeUpdateStage(query, update, upsert, multi) {
    let args = this.getBaseArgs();
    args.query = query;
    args.update = update;
    if (upsert) {
      args.upsert = true;
    }
    if (multi) {
      args.multi = true;
    }

    return {
      'service': this.db.service,
      'action': 'update',
      'args': args
    };
  }
}

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
