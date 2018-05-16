import StitchRequest from "./StitchRequest";
export default class StitchAuthRequest extends StitchRequest {
    static Builder: any;
    readonly useRefreshToken: boolean;
    constructor(request: StitchRequest, useRefreshToken: boolean);
    readonly builder: any;
}
