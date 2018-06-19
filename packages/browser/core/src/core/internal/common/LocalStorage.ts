import { Storage } from "mongodb-stitch-core-sdk";

export default class LocalStorage implements Storage {
  constructor(private readonly suiteName: string) {}

  public get(key: string): any {
    return localStorage.getItem(`${this.suiteName}.${key}`);
  }
  public set(key: string, value: string): any {
    return localStorage.setItem(`${this.suiteName}.${key}`, value);
  }
  public remove(key: string): any {
    return localStorage.removeItem(`${this.suiteName}.${key}`);
  }
}
