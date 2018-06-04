import { Storage } from "stitch-core";

export default class LocalStorage implements Storage {
  constructor(private readonly suiteName: string) {
  }

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

if (!window.localStorage) {
  Object.defineProperty(window, "localStorage", new (function () {
    const aKeys: string[] = [];
    const oStorage = {};
    Object.defineProperty(oStorage, "getItem", {
      configurable: false,
      enumerable: false,
      value (sKey) { return sKey ? this[sKey] : null; },
      writable: false,
    });
    Object.defineProperty(oStorage, "key", {
      configurable: false,
      enumerable: false,
      value (nKeyId) { return aKeys[nKeyId]; },
      writable: false,
    });
    Object.defineProperty(oStorage, "setItem", {
      configurable: false,
      enumerable: false,
      value (sKey, sValue) {
        if(!sKey) { return; }
        document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      },
      writable: false,
    });
    Object.defineProperty(oStorage, "length", {
      configurable: false,
      enumerable: false,
      get () { return aKeys.length; },
    });
    Object.defineProperty(oStorage, "removeItem", {
      configurable: false,
      enumerable: false,
      value (sKey) {
        if(!sKey) { return; }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      },
      writable: false,
    });    
    Object.defineProperty(oStorage, "clear", {
      configurable: false,
      enumerable: false,
      value () {
        if(!aKeys.length) { return; }
        for (const sKey of aKeys) {
          document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
      },
      writable: false,
    });
    this.get = () => {
      let iThisIndx: number;
      for (const sKey in oStorage) {
        if (oStorage.hasOwnProperty(sKey)) {
          iThisIndx = aKeys.indexOf(sKey);
          if (iThisIndx === -1) { oStorage["setItem"](sKey, oStorage[sKey]); }
          else { aKeys.splice(iThisIndx, 1); }
          delete oStorage[sKey];
        }
      }
      for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage["removeItem"](aKeys[0]); }
      for (let aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
        aCouple = aCouples[nIdx].split(/\s*=\s*/);
        if (aCouple.length > 1) {
          oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
          aKeys.push(iKey);
        }
      }
      return oStorage;
    };
    this.configurable = false;
    this.enumerable = true;
  })());
}