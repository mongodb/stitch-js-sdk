import BasicRequest from "./BasicRequest";
import Response from "./Response";
interface Transport {
    roundTrip(request: BasicRequest): Promise<Response>;
}
export default Transport;
