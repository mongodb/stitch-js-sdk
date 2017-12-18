'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.coding = coding;
exports.codingkey = codingkey;
exports.codingtype = codingtype;
exports.decode = decode;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function coding(codingKey, metatype) {
	return function (target, propName, descriptor) {
		var propNameId = codingKey ? codingKey : propName;

		if (target.__codingKeys == null) {
			target.__codingKeys = {};
		}

		if (target.__codingTypes == null) {
			target.__codingTypes = {};
		}

		target.__codingTypes[propName] = metatype;
		target.__codingKeys[propNameId] = propName;
	};
}

function codingkey(codingKey) {
	return function (target, propName, descriptor) {
		var propNameId = codingKey ? codingKey : propName;

		if (target.__codingKeys == null) {
			target.__codingKeys = {};
		}

		target.__codingKeys[propNameId] = propName;
	};
}

function codingtype(metatype) {
	return function (target, propName, descriptor) {
		if (target.__codingTypes == null) {
			target.__codingTypes = {};
		}

		target.__codingTypes[propName] = metatype;
	};
}

function _reviver(inst, key, value) {
	var codingKeys = inst.__codingKeys;
	if (codingKeys != null) {
		var newKey = codingKeys[key];
		if (newKey != null) {
			key = newKey;
		}
	}

	var meta = inst.__codingTypes;
	var codingType;
	if (meta != null) {
		codingType = meta[key];
	}

	if (Array.isArray(value)) {
		var _array = [];

		var _array = codingType == null ? [].concat(_toConsumableArray(value)) : value.map(function (item) {
			return _decode(Object.create(codingType.prototype), item);
		});

		inst[key] = _array;
	} else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
		if (codingType != null) {
			value = _decode(codingType.prototype, value);
		}

		inst[key] = value;
	} else {
		inst[key] = value;
	}
}

function _decode(inst, json) {
	for (var prop in json) {
		_reviver(inst, prop, json[prop]);
	}

	return inst;
}

function decode(json, ctor) {
	var inst = Object.create(ctor.prototype);

	_decode(inst, json);

	return inst;
}