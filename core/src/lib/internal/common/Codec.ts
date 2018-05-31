export interface Decoder<T> {
    decode(from: object): T;
}

export interface Encoder<T> {
    encode(from: T): object;
}

export interface Codec<T> extends Decoder<T>, Encoder<T> {
}
