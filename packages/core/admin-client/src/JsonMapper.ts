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
	readonly omitEmpty?: boolean
}

export interface PropertyMetadata<T> {
	readonly fieldKey: string
	readonly typeCtor?: TypeCtor<T>
	readonly omitEmpty: boolean
	readonly ignore: boolean
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
		const parent = Object.getPrototypeOf(type.prototype).constructor.name;
		if (parent !== undefined) {
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
		const value: PropertyMetadata<any> | undefined = metadata.properties.get(key);
		if (value === undefined) {
			jsonObject[key] = target[key];
			return;
		}

		if (value.ignore) {
			return;
		}

		let jsonValue = target[key];
		if (jsonValue === undefined && value.omitEmpty) {
			return;
		}

		if (jsonValue !== undefined && value.typeCtor !== undefined) {
			jsonValue = serialize(jsonValue);
		}

		jsonObject[value.fieldKey] = jsonValue;
	});

	return jsonObject;
}
