import StitchUserIdentity from "../StitchUserIdentity";
import IStitchUserProfile from "../StitchUserProfile";
export default class StitchUserProfileImpl implements IStitchUserProfile {
    static empty(): StitchUserProfileImpl;
    readonly userType?: string;
    readonly data: {
        [key: string]: string;
    };
    readonly identities: StitchUserIdentity[];
    constructor(userType?: string, data?: {
        [key: string]: string;
    }, identities?: StitchUserIdentity[]);
    readonly name: string | undefined;
    readonly email: string | undefined;
    readonly pictureURL: string | undefined;
    readonly firstName: string | undefined;
    readonly lastName: string | undefined;
    readonly gender: string | undefined;
    readonly birthday: string | undefined;
    readonly minAge: number | undefined;
    readonly maxAge: number | undefined;
}
