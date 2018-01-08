'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _errors = require('./errors');

exports.default = {
  /**
   * Filters its input documents and outputs only those documents that match
   * its query filter condition.
   *
   * The match action cannot be in the first stage of a pipeline. The stage
   * preceding the match action stage must output documents; for example, a
   * built-in action literal stage.
   *
   * @param {Object} expression Query filter against which to compare each incoming document.
   *                   Specify the filter as a JSON document. Filter expression can
   *                   include MongoDB query expressions as well as variables ($$vars)
   *                   defined in the stage.
   * @return {Object}
   */
  match: function match(expression) {
    return { service: '', action: 'match', args: { expression: expression } };
  },

  /**
   * Explicitly defines the documents to output from the stage.
   *
   * You can only use the literal action in the first stage of a pipeline.
   *
   * @param {Array|Object} items Documents to output. Documents can reference
   *                       variables ($$vars) defined in the stage.
   * @return {Object}
   */
  literal: function literal(items) {
    items = Array.isArray(items) ? items : [items];
    return { service: '', action: 'literal', args: { items: items } };
  },

  /**
   * Determines which fields to include or exclude in the output documents.
   *
   * The project action cannot be in the first stage of a pipeline. The stage
   * preceding the project action stage must output documents; for example, a
   * built-in action literal stage.
   *
   * @param {Object} projection A document that specifies field inclusions or field
   *                   exclusions. A projection document cannot specify both
   *                   field inclusions and field exclusions.
   * @returns {Object}
   */
  project: function project(projection) {
    return { service: '', action: 'project', args: { projection: projection } };
  },

  /**
   * Does nothing and outputs nothing. A null action stage may be useful as a
   * final stage for pipelines that do not need to return anything to the client.
   *
   * The null action stage ignores input to its stage as well its own arguments, if specified.
   * @returns {Object}
   */
  null: function _null() {
    return { service: '', action: 'null', args: {} };
  },

  /**
   * Decodes base64 or hexadecimal encoded data and outputs as binary data stream.
   *
   * You can only use the binary action in the first stage of a pipeline.
   *
   * @param {String} encoding the encoding format of data argument, one of ["hex", "base64"]
   * @param {String} data encoded data string to decode and pass on as binary data.
   * @returns {Object}
   */
  binary: function binary(encoding, data) {
    if (encoding !== 'hex' && encoding !== 'base64') {
      throw new _errors.StitchError('invalid encoding specified: ' + encoding);
    }

    return { service: '', action: 'binary', args: { encoding: encoding, data: data } };
  },

  /**
   * Encodes incoming binary data into specified format and outputs a document with
   * the field data which holds the encoded string.
   *
   * The encode action cannot be in the first stage of a pipeline. The stage preceding
   * the encode action stage must output a stream of binary data.
   *
   * @param {String} encoding encoding format for outgoing data, one of: ["hex", "base64"]
   * @returns {Object}
   */
  encode: function encode(encoding) {
    if (encoding !== 'hex' && encoding !== 'base64') {
      throw new _errors.StitchError('invalid encoding specified: ' + encoding);
    }

    return { service: '', action: 'encode', args: { encoding: encoding } };
  },

  /**
   * Reads a binary input stream and outputs a string.
   *
   * The reader action cannot be in the first stage of a pipeline. The stage preceding
   * the encode action stage must output a stream of binary data.
   *
   * @returns {Object}
   */
  reader: function reader() {
    return { service: '', action: 'reader', args: {} };
  },

  /**
   * Constructs the stages needed to execute a named pipeline
   *
   * @param {String} name name of the named pipeline to execute
   * @param {String|Object} [args] optional arguments to pass to the execution
   * @returns {Object}
   */
  namedPipeline: function namedPipeline(name, args) {
    return {
      service: '',
      action: 'namedPipeline',
      args: { name: name, args: args }
    };
  }
};
module.exports = exports['default'];