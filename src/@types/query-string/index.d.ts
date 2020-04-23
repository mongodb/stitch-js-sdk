declare module 'query-string' {
  export interface ParseOptions {
    readonly decode?: boolean;
    readonly arrayFormat?: 'bracket' | 'index' | 'comma' | 'separator' | 'none';
    readonly arrayFormatSeparator?: string;
    readonly sort?: ((itemLeft: string, itemRight: string) => number) | false;
    readonly parseNumbers?: boolean;
    readonly parseBooleans?: boolean;
  }

  export interface ParsedQuery<T = string> {
    [key: string]: T | T[] | null | undefined;
  }
  export function parse(
    query: string,
    options: { parseBooleans: true; parseNumbers: true } & ParseOptions
  ): ParsedQuery<string | boolean | number>;
  export function parse(query: string, options: { parseBooleans: true } & ParseOptions): ParsedQuery<string | boolean>;
  export function parse(query: string, options: { parseNumbers: true } & ParseOptions): ParsedQuery<string | number>;
  export function parse(query: string, options?: ParseOptions): ParsedQuery;

  export interface ParsedUrl {
    readonly url: string;
    readonly query: ParsedQuery;
  }

  export function parseUrl(url: string, options?: ParseOptions): ParsedUrl;

  export interface StringifyOptions {
    readonly strict?: boolean;
    readonly encode?: boolean;
    readonly arrayFormat?: 'bracket' | 'index' | 'comma' | 'separator' | 'none';
    readonly arrayFormatSeparator?: string;
    readonly sort?: ((itemLeft: string, itemRight: string) => number) | false;
    readonly skipNull?: boolean;
    readonly skipEmptyString?: boolean;
  }

  export function stringify(object: { [key: string]: any }, options?: StringifyOptions): string;

  export function extract(url: string): string;

  export function stringifyUrl(object: ParsedUrl, options?: StringifyOptions): string;
}
