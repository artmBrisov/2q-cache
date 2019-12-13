import { Cache } from "./cache";
import { SimpleCache } from "./simple_cache";
import { LfuCache } from "./lfu_cache";
import { CacheException } from "../cache2Q";

export class CacheFactory {
    public static makeMainStorage(type : string) : Cache {
        type = type.toUpperCase();
        switch(type) {
            case "LRU" : return new SimpleCache(0, 'lru');
            case "MRU" : return new SimpleCache(0, 'mru');
            case "LFU" : return new LfuCache(0);
            default : CacheFactory.throw("Unsupported Cache Type");
        }
    }

    private static throw(message : string) {
        throw new CacheException(message);
    }
}