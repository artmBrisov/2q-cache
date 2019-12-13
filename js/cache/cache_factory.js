"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple_cache_1 = require("./simple_cache");
const lfu_cache_1 = require("./lfu_cache");
const cache2Q_1 = require("../cache2Q");
class CacheFactory {
    static makeMainStorage(type) {
        type = type.toUpperCase();
        switch (type) {
            case "LRU": return new simple_cache_1.SimpleCache(0, 'lru');
            case "MRU": return new simple_cache_1.SimpleCache(0, 'mru');
            case "LFU": return new lfu_cache_1.LfuCache(0);
            default: CacheFactory.throw("Unsupported Cache Type");
        }
    }
    static throw(message) {
        throw new cache2Q_1.CacheException(message);
    }
}
exports.CacheFactory = CacheFactory;
