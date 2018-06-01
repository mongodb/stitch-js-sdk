import { Storage } from "stitch-core";

export default class LocalStorage implements Storage {
  public get(key: string): any {
    return localStorage.getItem(key);
  }
  public set(key: string, value: string): any {
    return localStorage.setItem(key, value);
  }
  public remove(key: string): any {
    return localStorage.removeItem(key);
  }
}
