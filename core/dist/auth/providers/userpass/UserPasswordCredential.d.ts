import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";
export default class UserPasswordCredential implements StitchCredential {
    readonly providerName: string;
    readonly username: string;
    readonly password: string;
    providerType: ProviderTypes;
    readonly material: {
        [key: string]: string;
    };
    readonly providerCapabilities: ProviderCapabilities;
    constructor(providerName: string, username: string, password: string);
}
