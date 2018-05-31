import * as EJSON from "mongodb-extjson";
import {
  CoreStitchAppClient,
  CoreStitchAuth,
  StitchAppRoutes,
  StitchRequestClient
} from "../../lib/";

describe("EJSON test", () => {
  it("should stringify Extended JSON correctly", () => {
    expect(
      EJSON.stringify({
        test: 42
      })
    ).toEqual('{"test":{"$numberInt":"42"}}');
  });
  it("should deserialize Extended JSON correctly", () => {
    expect(EJSON.parse('{ "$numberLong": "42" }', { strict: false })).toEqual(
      42
    );
  });
});
