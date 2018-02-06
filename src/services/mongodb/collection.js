import { serviceResponse } from '../../util';

/**
 * Creates a new Collection instance (not meant to be instantiated directly,
 * use `.collection()` on a {@link DB} instance).
 *
 * @class
 * @return {Collection} a Collection instance.
 */
class Collection {
  /**
   * @hideconstructor
   */
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  /**
   * Inserts a single document.
   *
   * @method
   * @param {Object} doc The document to insert.
   * @return {Promise<Object, Error>} a Promise for the operation.
   */
  insertOne(doc) {
    const args = { document: doc };
    return buildResponse('insertOne', this, buildArgs(this, args));
  }

  /**
   * Inserts multiple documents.
   *
   * @method
   * @param {Array} docs The documents to insert.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  insertMany(docs) {
    const args = { documents: Array.isArray(docs) ? docs : [ docs ] };
    return buildResponse('insertMany', this, buildArgs(this, args));
  }

  /**
   * Deletes a single document.
   *
   * @method
   * @param {Object} query The query used to match a single document.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  deleteOne(query) {
    return buildResponse('deleteOne', this, buildArgs(this, { query }));
  }

  /**
   * Deletes all documents matching query.
   *
   * @method
   * @param {Object} query The query used to match the documents to delete.
   * @return {Promise<Object, Error>} Returns a Promise for the operation.
   */
  deleteMany(query) {
    return buildResponse('deleteMany', this, buildArgs(this, { query }));
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
    return updateOp(this, false, query, update, options);
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
  updateMany(query, update) {
    return updateOp(this, true, query, update);
  }

  /**
   * Finds documents.
   *
   * @method
   * @param {Object} query The query used to match documents.
   * @param {Object} [project] The query document projection.
   * @return {MongoQuery} An object which allows for `limit` and `sort` parameters to be set.
   * `execute` will return a {Promise} for the operation.
   */
  find(query, project) {
    return new MongoQuery(this, query, project);
  }

  /**
   * Finds one document.
   *
   * @method
   * @param {Object} query The query used to match documents.
   * @param {Object} [project] The query document projection.
   * @return {Promise<Object, Error>} Returns a Promise for the operation
   */
  findOne(query, project) {
    return buildResponse('findOne', this, buildArgs(this, { query, project }));
  }

  /**
   * Executes an aggregation pipeline.
   *
   * @param {Array} pipeline The aggregation pipeline.
   * @returns {Array} The results of the aggregation.
   */
  aggregate(pipeline) {
    return aggregateOp(this, pipeline);
  }

  /**
   * Gets the number of documents matching the filter.
   *
   * @param {Object} query The query used to match documents.
   * @param {Object} options Additional count options.
   * @param {Number} [options.limit=null] The maximum number of documents to return.
   * @return {Number} The results of the count operation.
   */
  count(query, options = {}) {
    let outgoingOptions;
    if (options.limit) {
      outgoingOptions = { limit: options.limit };
    }

    return buildResponse('count', this, buildArgs(this, { count: true, query }, outgoingOptions));
  }
}

// private

function updateOp(service, isMulti, query, update, options = {}) {
  const action = isMulti ? 'updateMany' : 'updateOne';

  let outgoingOptions;
  if (!isMulti && options.upsert) {
    outgoingOptions = { upsert: true };
  }

  return buildResponse(action, service, buildArgs(service, { query, update }, outgoingOptions));
}

function findOp({ service, query, project, limit, sort }) {
  return buildResponse('find', service, buildArgs(service, { query, project, limit, sort }));
}

function aggregateOp(service, pipeline) {
  return buildResponse('aggregate', service, buildArgs(service, { pipeline }));
}

function buildArgs({ db: { name: database }, name: collection }, args, options = {}) {
  return Object.assign(
    { database, collection },
    args,
    options
  );
}

function buildResponse(action, service, args) {
  return serviceResponse(service.db, {
    serviceName: service.db.service,
    action,
    args
  });
}

// mongo query (find) support

function MongoQuery(service, query, project) {
  if (this instanceof MongoQuery) {
    this.service = service;
    this.query = query;
    this.project = project;
    return this;
  }
  return new MongoQuery(service, query, project);
}

MongoQuery.prototype.limit = function(limit) {
  this.limit = limit;
  return this;
};

MongoQuery.prototype.sort = function(sort) {
  this.sort = sort;
  return this;
};

MongoQuery.prototype.execute = function(resolve) {
  return findOp(this);
};

export default Collection;
