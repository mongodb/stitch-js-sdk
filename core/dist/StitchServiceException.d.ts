import { StitchErrorCode } from "./StitchErrorCode";
import StitchRequestException from "./StitchRequestException";
export default class StitchServiceException extends StitchRequestException {
    readonly errorCode: StitchErrorCode;
    constructor(message: string, errorCode?: StitchErrorCode);
}
