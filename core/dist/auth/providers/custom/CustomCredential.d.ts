import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";
export default class CustomCredential implements StitchCredential {
    providerName: string;
    readonly providerType: ProviderTypes;
    readonly providerCapabilities: ProviderCapabilities;
    private token;
    constructor(providerName: string, token: string);
    readonly material: {
        [key: string]: string;
    };
}
