import BasicRequest from "./BasicRequest";
import Response from "./Response";
import Transport from "./Transport";
export default class FetchTransport implements Transport {
    roundTrip(request: BasicRequest): Promise<Response>;
}
