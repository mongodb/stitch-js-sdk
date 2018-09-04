import { Codec } from "mongodb-stitch-core-sdk";
import AllowedRequestOriginsRoutes from "../internal/routes/AllowedRequestOriginsRoutes";
import { applyMixins, BasicResource, Gettable, Updatable } from "../Resources";

class AllowedRequestOriginsCodec implements Codec<string[]> {
    public decode(from: object): string[] {
        return from as string[];
    }

    public encode(from: string[]) {
        return from;
    }
}

class AllowedRequestOriginsUpdatableCodec implements Codec<string[][]> {
    public decode(from: object): string[][] {
        return from as string[][];
    }

    public encode(from: string[][]) {
        return from;
    }
}

export default class AllowedRequestOriginsResource extends BasicResource<AllowedRequestOriginsRoutes> 
    implements Gettable<string[], AllowedRequestOriginsRoutes>, Updatable<string[][], AllowedRequestOriginsRoutes> {
        public codec = new AllowedRequestOriginsCodec();
        public updatableCodec = new AllowedRequestOriginsUpdatableCodec();

        public get: () => Promise<string[]>;
        public update: (data) => Promise<string[][]>;
}
applyMixins(AllowedRequestOriginsResource, [Gettable, Updatable]);
