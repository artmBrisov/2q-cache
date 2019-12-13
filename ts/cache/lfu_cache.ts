import { Cache } from "./cache";
import { CacheHeap } from '../utils/cache_heap';
import { LfuMapElem, CacheHeapElem } from '../utils/cache_objects';

export class LfuCache implements Cache {

    private heap : CacheHeap;
    private searcher : Map<any, LfuMapElem>;

    constructor(size : number) {
        this.heap = new CacheHeap(size);
        this.searcher = new Map();
    }

    set(key: any, value: any, ttl: number): boolean {
        let oldMapElem = this.searcher.get(key);
        if (oldMapElem) {
            oldMapElem.data = value;
            clearTimeout(oldMapElem.timeout);
            if (ttl > 0) {
                oldMapElem.timeout = setTimeout(() => {
                    this.delete(key);
                }, ttl)
            }
        } else {
            let newMapElem = new LfuMapElem();
            let newHeapElem = new CacheHeapElem();

            newHeapElem.count = 0;
            newHeapElem.key = key;
            newHeapElem.index = -1;

            newMapElem.bucket = 2;
            newMapElem.data = value;
            newMapElem.linkToHeap = newHeapElem;

            this.searcher.set(key, newMapElem);
            let rejectedElem = this.heap.insert(newHeapElem);

            if (rejectedElem) {
                let rejectedMapElem = this.searcher.get(rejectedElem.key);
                if (rejectedMapElem) {
                    clearTimeout(rejectedMapElem.timeout);
                    this.searcher.delete(rejectedElem.key);
                }
                rejectedElem = null;
            }

            if (ttl > 0) {
                newMapElem.timeout = setTimeout(() => {
                    this.delete(key);
                }, ttl)
            }
        }

        return true;
    }
    
    update(key: any, value: any, ttl: number) {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            foundElem.data = value;
            clearTimeout(foundElem.timeout);
            if (ttl > 0) {
                foundElem.timeout = setTimeout(() => {
                    this.delete(key);
                }, ttl)
            }
            return true;
        } else {
            return false;
        }
    }

    get(key: any) : any {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            this.heap.increment(foundElem.linkToHeap);
            return foundElem.data;
        } else {
            return null;
        }
    }

    delete(key: any): boolean {
        let foundElem = this.searcher.get(key);

        if (foundElem) {
            clearTimeout(foundElem.timeout);
            this.heap.delete(foundElem.linkToHeap);
            this.searcher.delete(key);
        }

        return true;
    }

    has(key: any): boolean {
        return this.searcher.has(key);
    }

    clear(): void {
        this.setSize(0);
    }

    updateTtl(key: any, ttl: number): boolean {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            clearTimeout(foundElem.timeout);
            if (ttl > 0) {
                foundElem.timeout = setTimeout(() => {
                    this.delete(key);
                })
            }
        } else {
            return false;
        }
    }

    getSize(): number {
        return this.heap.getCount();
    }

    getMaxSize(): number {
        return this.heap.getMaxCount();
    }

    setSize(size: number): void {
        let rejectedArray : Array<CacheHeapElem> = this.heap.setMaxSize(size);
        rejectedArray.forEach(arrayElement => {
            let foundElem = this.searcher.get(arrayElement.key);
            if (foundElem) {
                clearTimeout(foundElem.timeout);
                this.searcher.delete(arrayElement.key);
            }
        })
    }

    getSizeObject(): object {
        return {
            currentSize : this.heap.getCount(),
            maxSize : this.heap.getMaxCount()
        }
    }
}