import * as sinon from 'sinon';
import { CoreStitchAppClient, StitchAppRoutes, CoreStitchAuth, StitchRequestClient } from '../../';
import StitchAppAuthRoutes from '../net/StitchAppAuthRoutes';
import * as EJSON from "mongodb-extjson";
import { StitchRequest } from '../net/StitchRequest';

describe("EJSON test", () => {
    it("should stringify Extended JSON correctly", () => {
        expect(EJSON.stringify({
            test: 42
        })).toEqual("{\"test\":{\"$numberInt\":\"42\"}}");
    })
    it("should deserialize Extended JSON correctly", () => {
        expect(EJSON.parse("{ \"$numberLong\": \"42\" }", {strict: false})).toEqual(42);
    })
});
