'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../../util');

var _mongodbExtjson = require('mongodb-extjson');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectID = _mongodbExtjson.BSON.ObjectID;

/**
 * Create a new Collection instance (not meant to be instantiated directly).
 *
 * @class
 * @return {Collection} a Collection instance.
 */

var Collection = function () {
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
   * @param {Object} [options] Additional options object.
   * @return {Promise<Object, Error>} a Promise for the operation.
   */


  _createClass(Collection, [{
    key: 'insertOne',
    value: function insertOne(doc) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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

  }, {
    key: 'insertMany',
    value: function insertMany(docs) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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

  }, {
    key: 'deleteOne',
    value: function deleteOne(query) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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

  }, {
    key: 'deleteMany',
    value: function deleteMany(query) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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

  }, {
    key: 'updateOne',
    value: function updateOne(query, update) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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

  }, {
    key: 'updateMany',
    value: function updateMany(query, update) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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

  }, {
    key: 'find',
    value: function find(query) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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

  }, {
    key: 'count',
    value: function count(query) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return findOp(this, query, Object.assign({}, options, {
        count: true
      }), function (result) {
        return !!result.result ? result.result[0] : 0;
      });
    }

    // deprecated

  }, {
    key: 'insert',
    value: function insert(docs) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return insertOp(this, docs, options);
    }
  }, {
    key: 'upsert',
    value: function upsert(query, update) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return updateOp(this, query, update, Object.assign({}, options, { upsert: true }));
    }
  }]);

  return Collection;
}();

// deprecated methods


Collection.prototype.upsert = (0, _util.deprecate)(Collection.prototype.upsert, 'use `updateOne`/`updateMany` instead of `upsert`');

// private
function insertOp(self, docs, options) {
  var stages = [];

  // there may be no docs, when building for chained pipeline stages in
  // which case the source is considered to be the previous stage
  if (docs) {
    docs = Array.isArray(docs) ? docs : [docs];

    // add ObjectIds to docs that have none
    docs = docs.map(function (doc) {
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

  return (0, _util.serviceResponse)(self.db, stages, function (response) {
    return {
      insertedIds: response.result.map(function (doc) {
        return doc._id;
      })
    };
  });
}

function deleteOp(self, query, options) {
  var args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query
  }, options);

  return (0, _util.serviceResponse)(self.db, {
    service: self.db.service,
    action: 'delete',
    args: args
  }, function (response) {
    return {
      deletedCount: response.result[0].removed
    };
  });
}

function updateOp(self, query, update, options) {
  var args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query,
    update: update
  }, options);

  return (0, _util.serviceResponse)(self.db, {
    service: self.db.service,
    action: 'update',
    args: args
  });
}

function findOp(self, query, options, finalizer) {
  finalizer = finalizer || function (response) {
    return response.result;
  };
  var args = Object.assign({
    database: self.db.name,
    collection: self.name,
    query: query
  }, options);

  // legacy argument naming
  if (args.projection) {
    args.project = args.projection;
    delete args.projection;
  }

  return (0, _util.serviceResponse)(self.db, {
    service: self.db.service,
    action: 'find',
    args: args
  }, finalizer);
}

exports.default = (0, _util.letMixin)(Collection);