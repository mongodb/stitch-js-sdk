"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MemoryStorage {
    constructor() {
        this.storage = {};
    }
    get(key) {
        return this.storage[key];
    }
    set(key, value) {
        this.storage[key] = value;
    }
    remove(key) {
        this.storage[key] = undefined;
    }
}
exports.MemoryStorage = MemoryStorage;
//# sourceMappingURL=Storage.js.map