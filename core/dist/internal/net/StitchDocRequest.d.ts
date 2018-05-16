import StitchRequest from "./StitchRequest";
export default class StitchDocRequest extends StitchRequest {
    static Builder: any;
    readonly document: object;
    constructor(request: StitchRequest, document: object);
    readonly builder: any;
}
