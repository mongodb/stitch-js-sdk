'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates a new Collection instance (not meant to be instantiated directly,
 * use `.collection()` on a {@link DB} instance).
 *
 * @class
 * @return {Collection} a Collection instance.
 */
var Collection = function () {
  /**
   * @hideconstructor
   */
  function Collection(db, name) {
    _classCallCheck(this, Collection);

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


  _createClass(Collection, [{
    key: 'insertOne',
    value: function insertOne(doc) {
      var args = { document: doc };
      return buildResponse('insertOne', this, buildArgs(this, args));
    }

    /**
     * Inserts multiple documents.
     *
     * @method
     * @param {Array} docs The documents to insert.
     * @return {Promise<Object, Error>} Returns a Promise for the operation.
     */

  }, {
    key: 'insertMany',
    value: function insertMany(docs) {
      var args = { documents: Array.isArray(docs) ? docs : [docs] };
      return buildResponse('insertMany', this, buildArgs(this, args));
    }

    /**
     * Deletes a single document.
     *
     * @method
     * @param {Object} query The query used to match a single document.
     * @return {Promise<Object, Error>} Returns a Promise for the operation.
     */

  }, {
    key: 'deleteOne',
    value: function deleteOne(query) {
      return buildResponse('deleteOne', this, buildArgs(this, { query: query }));
    }

    /**
     * Deletes all documents matching query.
     *
     * @method
     * @param {Object} query The query used to match the documents to delete.
     * @return {Promise<Object, Error>} Returns a Promise for the operation.
     */

  }, {
    key: 'deleteMany',
    value: function deleteMany(query) {
      return buildResponse('deleteMany', this, buildArgs(this, { query: query }));
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

  }, {
    key: 'updateOne',
    value: function updateOne(query, update) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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

  }, {
    key: 'updateMany',
    value: function updateMany(query, update) {
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

  }, {
    key: 'find',
    value: function find(query, project) {
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

  }, {
    key: 'findOne',
    value: function findOne(query, project) {
      return buildResponse('findOne', this, buildArgs(this, { query: query, project: project }));
    }

    /**
     * Executes an aggregation pipeline.
     *
     * @param {Array} pipeline The aggregation pipeline.
     * @returns {Array} The results of the aggregation.
     */

  }, {
    key: 'aggregate',
    value: function aggregate(pipeline) {
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

  }, {
    key: 'count',
    value: function count(query) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var outgoingOptions = void 0;
      if (options.limit) {
        outgoingOptions = { limit: options.limit };
      }

      return buildResponse('count', this, buildArgs(this, { count: true, query: query }, outgoingOptions));
    }
  }]);

  return Collection;
}();

// private

function updateOp(service, isMulti, query, update) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var action = isMulti ? 'updateMany' : 'updateOne';

  var outgoingOptions = void 0;
  if (!isMulti && options.upsert) {
    outgoingOptions = { upsert: true };
  }

  return buildResponse(action, service, buildArgs(service, { query: query, update: update }, outgoingOptions));
}

function findOp(_ref) {
  var service = _ref.service,
      query = _ref.query,
      project = _ref.project,
      limit = _ref.limit,
      sort = _ref.sort;

  return buildResponse('find', service, buildArgs(service, { query: query, project: project, limit: limit, sort: sort }));
}

function aggregateOp(service, pipeline) {
  return buildResponse('aggregate', service, buildArgs(service, { pipeline: pipeline }));
}

function buildArgs(_ref2, args) {
  var database = _ref2.db.name,
      collection = _ref2.name;
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return Object.assign({ database: database, collection: collection }, args, options);
}

function buildResponse(action, service, args) {
  return (0, _util.serviceResponse)(service.db, {
    serviceName: service.db.service,
    action: action,
    args: args
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

MongoQuery.prototype.limit = function (limit) {
  this.limit = limit;
  return this;
};

MongoQuery.prototype.sort = function (sort) {
  this.sort = sort;
  return this;
};

MongoQuery.prototype.execute = function (resolve) {
  return findOp(this);
};

exports.default = Collection;
module.exports = exports['default'];