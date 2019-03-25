import { EJSON } from "bson";

export interface Options<T> {
	readonly prototype?: Type<T>
	readonly omitEmpty?: boolean
}

interface Metadata<T> {
	readonly fieldKey: string
	readonly prototype?: Type<T>
	readonly omitEmpty: boolean
}

const keys: Map<string, Map<string, Metadata<any>>> = new Map();

export type Type<T> = new (...args: any[]) => T;

const targets = new Set()

// for each target (Class object), add a map of property names
export function jsonProperty<T>(fieldKey: string, options: Options<T> = { omitEmpty: false }) {
	return (target: any, propertyKey: string, parameterIndex?: number) => {
		let className = target.constructor.name;
		
		if (parameterIndex !== undefined) {
			propertyKey = Object.getOwnPropertyNames(new target)[parameterIndex];
			className = target.name;
		}
		let map = keys.get(className);
		if (!map) {
			map = new Map();
		}
		
		map.set(propertyKey, { fieldKey, prototype: options.prototype, omitEmpty: options.omitEmpty });
		
		// const parent = Object.getPrototypeOf(target.constructor.prototype).constructor.name;
		// if (parent !== undefined) {
		// 	const parentMap = keys.get(parent);
		// 	if (parentMap !== undefined) {
		// 		parentMap.forEach((value: Metadata<any>, key: string) => {
		// 			map.set(key, value);
		// 		});
		// 	}
		// }
		targets.add(target);
		keys.set(className, map);
	};
}

function checkRegistryFor<T>(obj: object, type: Type<T>): Map<string, Metadata<any>> {
	let keyMap = keys.get(type.name);

	if (keyMap === undefined) {
		keyMap = new Map();

		const parent = Object.getPrototypeOf(type.prototype).constructor.name;
		if (parent !== undefined) {
			const parentMap = keys.get(parent);
			if (parentMap !== undefined) {
				parentMap.forEach((value: Metadata<any>, key: string) => {
					keyMap.set(key, value);
				});
			}
		}
	}
	keys.set(type.name, keyMap);
	return keyMap;
}

export function deserialize<T>(parsed: object, type: Type<T>): T {
	const keyMap = checkRegistryFor(parsed, type);
	const t = new type;

	keyMap.forEach((value: Metadata<any>, key: string) => {
		let parsedValue = parsed[value.fieldKey];
		if (value.prototype !== undefined) {
			parsedValue = deserialize(parsedValue, value.prototype);
		}
		t[key] = parsedValue;
	});

	return t as T;
}

export function serialize(target: any): object {
	const keyMap = checkRegistryFor(target, target.constructor);
	const jsonObject = {};

	Object.keys(target).forEach((key: string) => {
		const value: Metadata<any> | undefined = keyMap.get(key);
		if (value === undefined) {
			jsonObject[key] = target[key];
			return;
		}

		let jsonValue = target[key];
		if (jsonValue === undefined && value.omitEmpty) {
			return;
		}

		if (jsonValue !== undefined && value.prototype !== undefined) {
			jsonValue = serialize(jsonValue);
		}

		jsonObject[value.fieldKey] = jsonValue;
	});

	return jsonObject;
}
