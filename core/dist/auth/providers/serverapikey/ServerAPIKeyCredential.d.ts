import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";
export default class ServerAPIKeyCredential implements StitchCredential {
    readonly providerName: string;
    readonly providerType: ProviderTypes;
    readonly material: {
        [key: string]: string;
    };
    readonly providerCapabilities: ProviderCapabilities;
    private readonly key;
    constructor(providerName: string, key: string);
}
