import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";
export default class GoogleCredential implements StitchCredential {
    readonly providerName: string;
    readonly providerType: ProviderTypes;
    readonly material: {
        [key: string]: string;
    };
    readonly providerCapabilities: ProviderCapabilities;
    private readonly authCode;
    constructor(providerName: string, authCode: string);
}
