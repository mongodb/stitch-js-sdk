import { StitchCredential } from "stitch-core";

export default interface StitchRedirectCredential extends StitchCredential {
    readonly redirectUrl?: string
}
