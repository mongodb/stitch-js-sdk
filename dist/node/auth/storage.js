'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createStorage = createStorage;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MemoryStorage = function () {
  function MemoryStorage() {
    _classCallCheck(this, MemoryStorage);

    this._data = {};
  }

  _createClass(MemoryStorage, [{
    key: 'getItem',
    value: function getItem(key) {
      return key in this._data ? this._data[key] : null;
    }
  }, {
    key: 'setItem',
    value: function setItem(key, value) {
      this._data[key] = value;
      return this._data[key];
    }
  }, {
    key: 'removeItem',
    value: function removeItem(key) {
      delete this._data[key];
      return undefined;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._data = {};
      return this._data;
    }
  }]);

  return MemoryStorage;
}();

var Storage = function () {
  function Storage(store) {
    _classCallCheck(this, Storage);

    this.store = store;
  }

  _createClass(Storage, [{
    key: 'get',
    value: function get(key) {
      return this.store.getItem(key);
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      return this.store.setItem(key, value);
    }
  }, {
    key: 'remove',
    value: function remove(key) {
      return this.store.removeItem(key);
    }
  }, {
    key: 'clear',
    value: function clear() {
      return this.store.clear();
    }
  }]);

  return Storage;
}();

function createStorage(type) {
  if (type === 'localStorage') {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
      return new Storage(window.localStorage);
    }
  } else if (type === 'sessionStorage') {
    if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage !== null) {
      return new Storage(window.sessionStorage);
    }
  }

  // default to memory storage
  return new Storage(new MemoryStorage());
}