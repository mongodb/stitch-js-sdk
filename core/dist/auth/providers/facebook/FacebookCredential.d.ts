import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";
export default class FacebookCredential implements StitchCredential {
    readonly providerName: string;
    readonly providerType: ProviderTypes;
    private readonly accessToken;
    constructor(providerName: string, accessToken: string);
    readonly material: {
        [key: string]: string;
    };
    readonly providerCapabilities: ProviderCapabilities;
}
