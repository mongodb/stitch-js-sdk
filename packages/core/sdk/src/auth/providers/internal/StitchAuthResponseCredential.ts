import AuthInfo from "../../internal/AuthInfo";
import ProviderCapabilities from "../../ProviderCapabilities";
import StitchCredential from "../../StitchCredential";

export default class StitchAuthResponseCredential implements StitchCredential {
    /**
     * The name of the authentication provider that this credential will be used to authenticate with.
     */
    public readonly providerName: string;

    /**
     * The type of the authentication provider that this credential will be used to authenticate with.
     */
    public readonly providerType: string;

    /**
     * A `ProviderCapabilities` object describing the behavior of this credential when logging in.
     */
    public providerCapabilities: ProviderCapabilities;

    /**
     * The contents of this credential as they will be passed to the Stitch server.
     */
    public readonly material: { [key: string]: string };

    /**
     * The contents of this credential as they will be passed to the Stitch server.
     */
    public constructor(public readonly authInfo: AuthInfo) {
    }
}
