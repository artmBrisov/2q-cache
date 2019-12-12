"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lru_1 = require("./lru");
const cache2Q_1 = require("../cache2Q");
class CacheFactory {
    static makeMainStorage(type) {
        type = type.toUpperCase();
        switch (type) {
            case "LRU": return new lru_1.LruCache(0);
            default: CacheFactory.throw("Unsupported Cache Type");
        }
    }
    static throw(message) {
        throw new cache2Q_1.CacheException(message);
    }
}
exports.CacheFactory = CacheFactory;
