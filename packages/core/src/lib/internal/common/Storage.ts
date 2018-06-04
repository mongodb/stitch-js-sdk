interface Storage {
  get(key: string): string;

  set(key: string, value: string);

  remove(key: string);
}

class MemoryStorage implements Storage {
  private readonly storage = {};

  public get(key: string): string {
    return this.storage[key];
  }

  public set(key: string, value: string) {
    this.storage[key] = value;
  }

  public remove(key: string) {
    this.storage[key] = undefined;
  }
}

export { Storage, MemoryStorage };
