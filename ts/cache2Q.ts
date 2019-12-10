import { LruCache } from './utils/lru';
import { CacheBuckets } from './utils/buckets';

class CacheException extends Error {
    constructor(message) {
        super();
        console.error(message);
    }
}

/**
 * @description Объект с параметрами инициализации Cache 2Q.
 * Все переданные параметры должны быть числами. 
 * Параметры будут округлены и в поля будут записаны их значения по модулю
 * В случае, если хотя бы один из параметров равен нулю или не является элементом типа number,
 * то будет выброшено исключение CacheConstructorParamsException
 * @param in_ Максимальное количество элементов корзины входа - number
 * @param out_ Размер корзины выхода - number
 * @param main_ Размер главной корзины - number
 * @throws CacheConstructorParamsException
*/

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

    private buckets : CacheBuckets;
    private lruCache : LruCache;

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
        } else if (Array.isArray(newSizes)) {
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

    constructor(size : number | Array<number>) {
        this.buckets = new CacheBuckets(0, 0);
        this.lruCache = new LruCache(0);
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
        let mainSize = this.lruCache.getMaxSize();

        let newSizes : Array<number> = this.caclulate(size);

        if ((newSizes[0] >= inSize) && (newSizes[1] >= outSize) && (newSizes[2] >= mainSize)) {
            this.buckets.setSize(newSizes[0], newSizes[1]);
            this.lruCache.setSize(newSizes[2]);
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
        this.lruCache.setSize(newSizes[2]);
       
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
    public set(key : any, value : any) : boolean {
        if (this.lruCache.has(key)) {
            this.lruCache.update(key, value);
            return true;
        }
        return this.buckets.set(key, value);
    }

    /**
     * @description Returns value by presented key, if key exists, otherwise returns null
     * @param key 
     */
    
    public get(key : any) : object {
        let found = this.lruCache.get(key);
        if (!found) {
            let transport = this.buckets.get(key);
            if (transport.needMove) {
                this.lruCache.set(transport.key, transport.value);
            }
            return transport.value;
        }

        return null;
    }

    /**
     * @description Returns true if key exists, otherwise returns false
     * @param key 
     */

    public has(key : any) : boolean {
        return this.lruCache.has(key) || this.buckets.has(key);
    }
    
    /**
     * @description If key exists, it deletes pair (key, value) from cache and returns true
     * 
     * If key doesn't exists, returns false;
     * 
     * @param key 
     */

    public delete(key : any) : boolean {
        if (this.lruCache.has(key)) {
            this.lruCache.delete(key);
            return true;
        } else if(this.buckets.has(key)) {
            this.buckets.delete(key);
            return true;
        }

        return false;
    }
    
    /**
     * @description Makes cache empty
     */
    public clear() : boolean {
        this.buckets.clear();
        this.lruCache.clear();
        return true;
    }

    /**
     * @description Returns js - object, that contains currentCount/maxCount for each cache section
     */
    public getSize() : object {
        return {
           buckets : this.buckets.getSizeObject(),
           main : this.lruCache.getSizeObject()
        };
    }

}
