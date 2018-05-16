import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";
export default class UserAPIKeyCredential implements StitchCredential {
    readonly providerName: string;
    readonly key: string;
    readonly providerType: ProviderTypes;
    readonly material: {
        [key: string]: string;
    };
    readonly providerCapabilities: ProviderCapabilities;
    constructor(providerName: string, key: string);
}
