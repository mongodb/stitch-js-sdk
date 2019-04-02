/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type TypeCtor<T> = new (...args: any[]) => T;

export interface Options<T> {
	readonly typeCtor?: TypeCtor<T>
	readonly isArray?: boolean
	readonly omitEmpty?: boolean
}

export interface PropertyMetadata<T> {
	readonly fieldKey: string
	readonly typeCtor?: TypeCtor<T>
	readonly omitEmpty: boolean
	readonly ignore: boolean
	readonly isArray: boolean
}

export class ClassMetadata<T> {
	public hasParentMetadata = false;
	public readonly properties = new Map<string, PropertyMetadata<any>>();

	constructor(
		readonly type: TypeCtor<T>,
		readonly name: string) {
	}
}

const metadatas: Map<string, ClassMetadata<any>> = new Map();

export function jsonIgnore() {
	return jsonProperty("", { omitEmpty: true }, true);
}

export function jsonProperty<T>(fieldKey: string, options: Options<T> = { omitEmpty: false }, ignore = false) {
	return (target: any, propertyKey: string, parameterIndex?: number) => {
		let className = target.constructor.name;
		
		if (parameterIndex !== undefined) {
			propertyKey = Object.getOwnPropertyNames(new target)[parameterIndex];
			className = target.name;
		}

		let metadata = metadatas.get(className);
		if (!metadata) {
			metadata = new ClassMetadata(target.constructor, className);
		}
		
		metadata.properties.set(propertyKey, { 
			fieldKey, 
			ignore,
			isArray: options.isArray ? options.isArray : false,
			omitEmpty: options.omitEmpty ? options.omitEmpty : false,
			typeCtor: options.typeCtor,
		});
		
		metadatas.set(className, metadata);
	};
}

export function checkRegistryFor<T>(type: TypeCtor<T>): ClassMetadata<T> {
	let metadata = metadatas.get(type.name);
	
	if (metadata === undefined) {
		metadata = new ClassMetadata(type, type.name);
	}

	if (!metadata.hasParentMetadata) {
		const parentPrototype = Object.getPrototypeOf(type.prototype);
		if (parentPrototype) {
			const parent = parentPrototype.constructor.name;
			const parentMetadata = metadatas.get(parent);
			if (parentMetadata !== undefined) {
				parentMetadata.properties.forEach((value: PropertyMetadata<any>, key: string) => {
					if (!metadata!.properties.has(key)) {
						metadata!.properties.set(key, value);
					}
				});
			}
		}
		metadata.hasParentMetadata = true;
	}

	metadatas.set(type.name, metadata);
	return metadata;
}

export function deserialize<T>(parsed: object, type: TypeCtor<T>): T {
	const metadata = checkRegistryFor(type);
	const t = new type;
	if (parsed === undefined) {
		return t;
	}
	const parsedKeys = new Set(Object.keys(parsed));
	metadata.properties.forEach((value: PropertyMetadata<any>, key: string) => {
		parsedKeys.delete(value.fieldKey);
		let parsedValue = parsed[value.fieldKey];
		if (value.typeCtor !== undefined) {
			parsedValue = deserialize(parsedValue, value.typeCtor);
		}
		t[key] = parsedValue;
	});

	parsedKeys.forEach(key => {
		t[key] = parsed[key];
	})

	return t as T;
}

export function serialize(target: any): object {
	const metadata = checkRegistryFor(target.constructor);
	const jsonObject = {};

	Object.keys(target).forEach((key: string) => {
		// fetch the metadata for the given property, by its key
		const value: PropertyMetadata<any> | undefined = metadata.properties.get(key);
		// if we have no metadata, place the raw value into the jsonObject
		if (value === undefined) {
			jsonObject[key] = target[key];
			return;
		}

		// if the metadata says to ignore, ignore the value
		if (value.ignore) {
			return;
		}

		// read the raw jsonValue
		let jsonValue = target[key];
		// if the value is undefined and we should omit on empty, return
		if (!jsonValue && value.omitEmpty) {
			return;
		}

		// if the value is defined and we have a type constructor, serialize that value
		// processing it into the appropriate form
		if (jsonValue && value.typeCtor !== undefined) {
			jsonValue = value.isArray ?
				jsonValue.map(element => serialize(element)) : serialize(jsonValue);
		}

		jsonObject[value.fieldKey] = jsonValue;
	});
	return jsonObject;
}
