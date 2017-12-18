// @flow
export function coding(codingKey: ?string, metatype: ?Object) {
	return function(target : Object, propName : string, descriptor: Object) {
    	let propNameId: string  = (codingKey) ? codingKey : propName;

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

export function codingkey(codingKey: string) {
	return function(target : Object, propName : string, descriptor: Object) {
    	let propNameId: string  = (codingKey) ? codingKey : propName;

	    if (target.__codingKeys == null) {
    		target.__codingKeys = {};
    	}

    	target.__codingKeys[propNameId] = propName;
  	};
}

export function codingtype(metatype: constructor) {
	return function(target : Object, propName : string, descriptor: Object) {
    	if (target.__codingTypes == null) {
    		target.__codingTypes = {};
    	}

    	target.__codingTypes[propName] = metatype;
  	};
}

function _reviver(inst: any, key: string, value: any): any {
	const codingKeys = inst.__codingKeys;
	if (codingKeys != null) {
		const newKey = codingKeys[key];
		if (newKey != null) {
			key = newKey;
		}
	}

	const meta = inst.__codingTypes;
	var codingType: constructor
	if (meta != null) {
		codingType = meta[key];
	}

	if (Array.isArray(value)) {			
		var array = [];
		
		const array = 
  		  codingType == null ?
    		[...value] :
    		value.map(
      			(item) => _decode(Object.create(codingType.prototype), item)
    		);

		inst[key] = array;
	} else if (typeof value == 'object') {			
		if (codingType != null) {
			value = _decode(codingType.prototype, value);
		}

		inst[key] = value;
	} else {
		inst[key] = value;
	}
}

function _decode(inst: any, json: Object): any {
	for (const prop in json) {
		_reviver(inst, prop, json[prop]);
	}

	return inst;
}

export function decode<T>(json: Object, ctor: Class<T>): T {
	const inst: any = Object.create((ctor: Object).prototype);

	_decode(inst, json);
	
	return (inst: T);
}
