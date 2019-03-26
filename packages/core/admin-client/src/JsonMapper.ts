// TODO: Add Array support

export type Type<T> = new (...args: any[]) => T;

export interface Options<T> {
	readonly prototype?: Type<T>
	readonly omitEmpty?: boolean
}

export interface PropertyMetadata<T> {
	readonly fieldKey: string
	readonly prototype?: Type<T>
	readonly omitEmpty: boolean
	readonly ignore: boolean
}

export class ClassMetadata<T> {
	public hasParentMetadata = false;
	public readonly properties = new Map<string, PropertyMetadata<any>>();

	constructor(
		readonly type: Type<T>,
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
			prototype: options.prototype,
		});
		
		metadatas.set(className, metadata);
	};
}

export function checkRegistryFor<T>(type: Type<T>): ClassMetadata<T> {
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

export function deserialize<T>(parsed: object, type: Type<T>): T {
	const metadata = checkRegistryFor(type);
	const t = new type;
	if (parsed === undefined) {
		return t;
	}
	const parsedKeys = new Set(Object.keys(parsed));
	metadata.properties.forEach((value: PropertyMetadata<any>, key: string) => {
		parsedKeys.delete(value.fieldKey);
		let parsedValue = parsed[value.fieldKey];
		if (value.prototype !== undefined) {
			parsedValue = deserialize(parsedValue, value.prototype);
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

		if (jsonValue !== undefined && value.prototype !== undefined) {
			jsonValue = serialize(jsonValue);
		}

		jsonObject[value.fieldKey] = jsonValue;
	});

	return jsonObject;
}
