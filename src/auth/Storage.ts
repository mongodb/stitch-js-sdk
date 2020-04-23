export class MemoryStorage {
  private readonly data: Record<string, any> = {};

  private readonly orderedKeys: any[] = [];

  private length = 0;

  public getItem(key: string): any {
    // tslint:disable:no-null-keyword
    return key in this.data ? this.data[key] : null;
  }

  public setItem(key: string, value: string) {
    this.orderedKeys.push(key);
    this.data[key] = value;
    this.length++;
    return this.data[key];
  }

  public removeItem(key: string) {
    const index = this.orderedKeys.indexOf(key, 0);
    if (index > -1) {
      this.orderedKeys.splice(index, 1);
    }
    delete this.data[key];
    this.length--;
  }

  public key(index: number): string | null {
    return this.orderedKeys[index];
  }
}

interface Container {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
  removeItem(key: string): void;
  key(index: number): string | null;
}

export class Storage {
  constructor(public readonly store: Container, private readonly namespace: string) {
    this.store = store;
    this.namespace = `_baas.${namespace}`;
  }

  public _generateKey(key: string): string {
    return `${this.namespace}.${key}`;
  }

  public get(key: string): any {
    return this.store.getItem(this._generateKey(key));
  }

  public set(key: string, value: any) {
    return this.store.setItem(this._generateKey(key), value);
  }

  public remove(key: string) {
    this.store.removeItem(this._generateKey(key));
  }
}

export function createStorage(options: { storageType?: string; namespace: string }) {
  const { storageType, namespace } = options;

  if (storageType === 'localStorage') {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
      return new Storage(window.localStorage, namespace);
    }
  }

  // default to memory storage
  return new Storage(new MemoryStorage(), namespace);
}
