import Response from "./internal/net/Response";
export default class StitchError {
    static handleRequestError(response: Response): never;
    private static handleRichError(response, body);
}
