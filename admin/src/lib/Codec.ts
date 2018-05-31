export abstract class Decoder<T> {
    constructor() {
    }

    abstract decode(from: object): T;
}

export abstract class Encoder<T> {
    constructor() {
    }

    abstract encode(from: T): object;
}
export abstract class Codec<T> implements Decoder<T>, Encoder<T> {
    constructor() {
    }

    abstract decode(from: object): T;
    abstract encode(from: T): object;
}
