import { Cache } from './cache/cache';
import { CacheFactory } from './cache/cache_factory';

import { CacheBuckets } from './buckets/buckets';

export class CacheException extends Error {
    constructor(message) {
        super(message);
    }
}

/**
 * @class Cache2Q
 * @classdesc 2Q Cache Implementation
 * @author ArtemBorisov
 * @description 
 * API
 * 
 * 0) 
 * 
 * 1) set (key : any, value : any) : boolean |
 * Inserts pair(key, value) in cache. If key exists, it will be delete and insert again
 * 
 * 2) get (key : any) : any value |
 * Returns value by presented key or null if key doesn't exists
 * 
 * 3) has (key : any) : boolean |
 * Returns true if key exists otherwise returns false
 * 
 * 4) delete (key : any) : boolean |
 * Deletes pair (key, value) from cache. If pair (key, value) doesn't exists,
 * returns false, otherwise returns true
 * 
 * 5) alloc(size : number or CacheConstructorParams) - see description of alloc on docs / in code
 * 
 * 6) allocUnsafe(size : number or CacheConstructorParams) - see description of allocUnsafe on docs / in code
 */
export class Cache2Q {

    private GLOBAL_TTL : number = 0;
    private useStringifyKeys : boolean = false;
    private useTtlInMain : boolean = false;


    private buckets : CacheBuckets;
    private main : Cache;
    private mainStorageType : string;

    private calculateSizes(size : number) : Array<number> {
        return [
            Math.floor(Math.abs(0.2 * size)),
            Math.floor(Math.abs(0.6 * size)),
            Math.floor(Math.abs(0.2 * size)),
        ];
    }

    private caclulate(size : number | Array<number>) {
        let newSizes : Array<number>;
        if (typeof(size) == 'number') {
            newSizes = this.calculateSizes(size);
        } else if (Array.isArray(size)) {
            size = size.filter(el => {
                return typeof(el) === 'number';
            })
            if (size.length === 3) {
                size = size.map(el => {
                    return Math.floor(Math.abs(el));
                })
                newSizes = size;
            } else {
                throw new CacheException("Invalid alloc params");
            }
        } else {
            throw new CacheException("Invalid alloc params");
        }
        
        return newSizes;
    }

    constructor(size : number | Array<number>, options : object) {
        if (typeof(options) === 'object' && !Array.isArray(options)) {
            this.GLOBAL_TTL = this.resolveTtl(options["ttl"]);
            this.useStringifyKeys = Boolean(options["stringKeys"]);
            this.useTtlInMain = Boolean(options["ttlInMain"]);
            this.mainStorageType = options["mainStorageType"] || 'lru';
        } else {
            this.GLOBAL_TTL = 0;
            this.useStringifyKeys = false;
            this.useTtlInMain = false;
            this.mainStorageType = 'lru';
        }
        this.buckets = new CacheBuckets(0, 0);
        this.main = CacheFactory.makeMainStorage(this.mainStorageType);
        this.allocUnsafe(size);
    }

     /**
     * @description Changes max cache capacity in general or in individual buckets.
     * Doesn't allow changes to the smaller side
     * @params size : number || Array [inSize : number, outSize : number, mainSize : number]
     * @throws CacheException
     */

    public alloc(size : number | Array<number>) : boolean {
        let bucketsSize : Array<number> = this.buckets.getMaxSize();
        let [inSize, outSize] = bucketsSize;
        let mainSize = this.main.getMaxSize();

        let newSizes : Array<number> = this.caclulate(size);

        if ((newSizes[0] >= inSize) && (newSizes[1] >= outSize) && (newSizes[2] >= mainSize)) {
            this.buckets.setSize(newSizes[0], newSizes[1]);
            this.main.setSize(newSizes[2]);
        } else {
            throw new CacheException("Changes to smaller side not allowed.\nYou should use allocUnsafe()");
        }

        return true;
    }

    /**
     * @description Changes max cache capacity in general or in individual buckets.
     * @params size : number || Array [inSize : number, outSize : number, mainSize : number]
     * Allow changes to the smaller side
     */
    public allocUnsafe(size : number | Array<number>) : boolean {
        let newSizes : Array<number> = this.caclulate(size);

        this.buckets.setSize(newSizes[0], newSizes[1]);
        this.main.setSize(newSizes[2]);
       
        return true;
    }   

    /**
     * @description Add new pair (key, value) into cache
     * 
     * If key already exists, its value will be changed
     * 
     * Else key will be inserted into "in" FIFO bucket
     * 
     * @param key 
     * @param value 
     */
    public set(key : any, value : any, ttl : number = 0) : boolean {
        key = this.resolveKey(key);
        ttl = this.resolveTtl(ttl);
        if (this.main.has(key)) {
            this.main.update(key, value, ttl);
            return true;
        }
        return this.buckets.set(key, value, ttl);
    }

    /**
     * 
     * @param objects Array<objects>, where objects : 
     * 
     * {
     *      key : any,
     *      value : any,
     *      ttl : number (optional)
     * }
     * 
     * @returns Array of insertion results (Array<boolean>)
     */

    public mset(objects : Array<object>) : Array<boolean> {
        let boolArray = [];
        objects.forEach(obj => {
            boolArray.push(this.set(obj["key"], obj["value"], obj["ttl"]));
        })
        return boolArray;
    }

    /**
     * @description Returns value by presented key, if key exists, otherwise returns null
     * @param key 
     */
    
    public get(key : any) : object {
        key = this.resolveKey(key);
        let found = this.main.get(key);
        if (!found) {
            let transport = this.buckets.get(key);
            if (transport) {
                if (transport.needMove) {
                    let timeout = this.useTtlInMain ? transport.timeout : 0;
                    this.main.set(transport.key, transport.value, timeout);
                }
                return transport.value;
            } else {
                return null;
            }     
        }

        return null;
    }

    /**
     * Returns array of values by presented keys
     * @param keys Array of keys
     */

    public mget(keys : Array<any>) : Array<any> {
        let values : Array<any> = [];
        keys.forEach(key => {
            values.push(this.get(key));
        })
        return values;
    }

    /**
     * @description Returns true if key exists, otherwise returns false
     * @param key 
     */

    public has(key : any) : boolean {
        key = this.resolveKey(key);
        return this.main.has(key) || this.buckets.has(key);
    }

    /**
     * Returns boolean array with results of has(key[i]) 
     * @param keys Array of keys
     */

    public mhas(keys : Array<any>) : Array<boolean> {
        let boolArray = [];
        keys.forEach(key => {
            boolArray.push(this.has(key));
        })
        return boolArray;
    }
    
    /**
     * @description If key exists, it deletes pair (key, value) from cache and returns true
     * 
     * If key doesn't exists, returns false;
     * 
     * @param key 
     */

    public delete(key : any) : boolean {
        key = this.resolveKey(key);
        if (this.main.has(key)) {
            this.main.delete(key);
            return true;
        } else if(this.buckets.has(key)) {
            this.buckets.delete(key);
            return true;
        }

        return false;
    }
    
    /**
     * 
     * @param keys Array of keys to delete
     * @returns Array of boolean  - result of each deletion 
     */

    public mdel(keys : Array<any>) : Array<boolean> {
        let boolArray = [];
        keys.forEach(key => {
            boolArray.push(this.delete(key));
        })
        return boolArray;
    }

    /**
     * Updates ttl for elem by key
     * @param keys Array of objects {key : "any key", ttl : number}
     */

    public resetTtl(key : any, ttl : number) {
        key = this.resolveKey(key);
        ttl = this.resolveTtl(ttl);
        if (this.main.has(key)) {
            this.main.updateTtl(key, ttl);
        } else {
            this.buckets.updateTtl(key, ttl)
        }
    }


    /**
     * Updates ttl for each key in param array
     * @param keys Array of objects {key : "any key", ttl : number}
     */
    public mresetTtl(params : Array<object>) {
        params.forEach((elem) => {
            this.resetTtl(elem["key"], elem["ttl"]);
        })
    }


    private resolveTtl(ttl : number) {
        if (typeof(ttl) === 'number' && ttl > 0) {
            return ttl;
        } else {
            return this.GLOBAL_TTL;
        }
    }

    private resolveKey(key : any) {
        if (this.useStringifyKeys) {
            if (typeof(key) == 'number') {
                return String(key);
            } else if (typeof(key) == 'string') {
                return key;
            } else {
                try { 
                    return JSON.stringify(key);
                } catch(e) {
                    throw new CacheException(`Can't resolve key to string using JSON.stringify.\n You should use 
                            json-convertable keys or disable 'useStringifyKeys' by method setStringifyKeys(false)`);
                } 
            }
        } else {
            return key;
        }
    }

    /**
     * @description Makes cache empty
     */
    public clear() : boolean {
        this.buckets.clear();
        this.main.clear();
        return true;
    }

    /**
     * @description Sets default time to deletion of cache objects.
     * 
     * It will be works only for new objects, not for objects, that already exists in cache
     * 
     * @param ttl 
     */
    public setDefaultTtl(ttl : number) {
        if (typeof(ttl) === 'number' && ttl > 0) {
            this.GLOBAL_TTL = ttl;
            return true;
        }
        return false;
    }

    /**
     * @description Sets param useStringifyKeys
     * 
     * It will be works only for new objects, not for objects, that already exists in cache
     * 
     * @param ttl 
     */

    setStringifyKeys(boolParam : boolean) {
        this.useStringifyKeys = boolParam;
    }

    /**
     * @description Disables default time to deletion of cache objects.
     * 
     * It will be works only for new objects, not for objects, that already exists in cache
     * 
     * @param ttl 
     */

    public disableTtl() : boolean {
        this.GLOBAL_TTL = 0;
        return true;
    }

    /**
     * @description Returns js - object, that contains currentCount/maxCount for each cache section
     */

    public getSize() : object {
        return {
           buckets : this.buckets.getSizeObject(),
           main : this.main.getSizeObject()
        };
    }

}
