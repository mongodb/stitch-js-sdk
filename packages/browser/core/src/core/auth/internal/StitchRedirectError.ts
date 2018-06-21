import { StitchError } from "mongodb-stitch-core-sdk";

export default class StitchRedirectError extends StitchError {
    constructor(msg: string) { super(msg); }
}