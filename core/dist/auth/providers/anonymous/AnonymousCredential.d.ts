import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";
import ProviderTypes from "../ProviderTypes";
export default class AnonymousCredential implements StitchCredential {
    readonly providerName: string;
    readonly providerType: ProviderTypes;
    readonly material: {};
    readonly providerCapabilities: ProviderCapabilities;
    constructor(providerName: string);
}
