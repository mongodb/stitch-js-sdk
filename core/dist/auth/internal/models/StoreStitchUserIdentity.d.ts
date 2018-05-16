import StitchUserIdentity from "../../StitchUserIdentity";
export default class StoreStitchUserIdentity extends StitchUserIdentity {
    id: string;
    providerType: string;
    constructor(id: string, providerType: string);
}
