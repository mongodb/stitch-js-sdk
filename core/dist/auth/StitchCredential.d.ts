import ProviderCapabilities from "./ProviderCapabilities";
interface StitchCredential {
    readonly providerName: string;
    readonly providerType: string;
    readonly material: {
        [key: string]: string;
    };
    providerCapabilities: ProviderCapabilities;
}
export default StitchCredential;
