interface Storage {
  get(key: string): string;

  set(key: string, value: string);

  remove(key: string);
}

class MemoryStorage implements Storage {
  private readonly storage = {};
  constructor(private readonly suiteName: string) {}

  public get(key: string): string {
    return this.storage[`${this.suiteName}.${key}`];
  }

  public set(key: string, value: string) {
    this.storage[`${this.suiteName}.${key}`] = value;
  }

  public remove(key: string) {
    delete this.storage[`${this.suiteName}.${key}`];
  }
}

export { Storage, MemoryStorage };
