import { Cache } from "./cache";
import { LruCache } from "./lru";
import { CacheException } from "../cache2Q";

export class CacheFactory {
    public static makeMainStorage(type : string) : Cache {
        type = type.toUpperCase();
        switch(type) {
            case "LRU" : return new LruCache(0);
            default : CacheFactory.throw("Unsupported Cache Type");
        }
    }

    private static throw(message : string) {
        throw new CacheException(message);
    }
}