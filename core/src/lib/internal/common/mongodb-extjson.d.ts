declare module 'mongodb-extjson' {
    export type Options = {
        relaxed?: boolean
        strict?: boolean
    }

    export function parse(text: string, options?: Options);
    export function stringify(
        value: Array<any> | object, 
        reducer?: ((key: string, value: any) => any) | Options, 
        indents?: (string | number) | Options,
        options?: Options
    )
}
