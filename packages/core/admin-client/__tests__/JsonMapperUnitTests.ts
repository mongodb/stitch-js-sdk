import { checkRegistryFor, deserialize, jsonProperty, serialize } from "../src/JsonMapper";

class Foo {
	public bar: string;
}

class Ham {
	@jsonProperty("green_eggs")
	public greenEggs: string;

	@jsonProperty("foo", { typeCtor: Foo })
	public foo: Foo;
}

class Spam extends Ham {
	@jsonProperty("is_canned")
	public isCanned = true;
}

describe("json mapper", () => {
	it("should contain empty Foo", () => {
		const metadata = checkRegistryFor(Foo);
		expect(metadata.name).toEqual("Foo");
		expect(metadata.properties.size).toEqual(0);
		expect(metadata.type).toEqual(Foo);
		expect(metadata.hasParentMetadata).toBeTruthy();
	});

	it("should default serialize", () => {
		const foo = new Foo();

		expect(serialize(foo).bar).toBeUndefined();

		foo.bar = "baz";

		expect(serialize(foo).bar).toEqual("baz");
	});

	it("should default deserialize", () => {
		const foo = new Foo();
		foo.bar = "baz";
		const deserialized = deserialize({bar: "baz"}, Foo);
		expect(deserialized).toEqual(foo);
	});

	it("should contain metadata for Spam type", () => {
		const metadata = checkRegistryFor(Spam);
		expect(metadata.name).toEqual("Spam");
		expect(metadata.properties.size).toEqual(3);
		const greenEggs = metadata.properties.get("greenEggs");
		
		expect(greenEggs.fieldKey).toEqual("green_eggs");
		expect(greenEggs.ignore).toBeFalsy();
		expect(greenEggs.omitEmpty).toBeFalsy();
		expect(greenEggs.typeCtor).toBeUndefined();

		const foo = metadata.properties.get("foo");
		
		expect(foo.fieldKey).toEqual("foo");
		expect(foo.ignore).toBeFalsy();
		expect(foo.omitEmpty).toBeFalsy();
		expect(foo.typeCtor).toEqual(Foo);

		const isCanned = metadata.properties.get("isCanned");
		
		expect(isCanned.fieldKey).toEqual("is_canned");
		expect(isCanned.ignore).toBeFalsy();
		expect(isCanned.omitEmpty).toBeFalsy();
		expect(isCanned.typeCtor).toBeUndefined();

		expect(metadata.type).toEqual(Spam);
		expect(metadata.hasParentMetadata).toBeTruthy();
	});

	it("should round trip Ham type", () => {
		const spam = new Spam();
		spam.foo = new Foo();
		spam.foo.bar = "baz";
		spam.greenEggs = "I do not like them";

		const serialized = serialize(spam);

		expect(serialized.foo).toEqual({bar: "baz"})
		expect(serialized.green_eggs).toEqual("I do not like them");
		expect(serialized.is_canned).toBeTruthy();

		const deserialized = deserialize(serialized, Spam);

		expect(deserialized).toEqual(spam);
	});
});
