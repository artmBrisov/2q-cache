"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_heap_1 = require("../utils/cache_heap");
const cache_objects_1 = require("../utils/cache_objects");
class LfuCache {
    constructor(size) {
        this.heap = new cache_heap_1.CacheHeap(size);
        this.searcher = new Map();
    }
    set(key, value, ttl) {
        let oldMapElem = this.searcher.get(key);
        if (oldMapElem) {
            oldMapElem.data = value;
            clearTimeout(oldMapElem.timeout);
            if (ttl > 0) {
                oldMapElem.timeout = setTimeout(() => {
                    this.delete(key);
                }, ttl);
            }
        }
        else {
            let newMapElem = new cache_objects_1.LfuMapElem();
            let newHeapElem = new cache_objects_1.CacheHeapElem();
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
                }, ttl);
            }
        }
        return true;
    }
    update(key, value, ttl) {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            foundElem.data = value;
            clearTimeout(foundElem.timeout);
            if (ttl > 0) {
                foundElem.timeout = setTimeout(() => {
                    this.delete(key);
                }, ttl);
            }
            return true;
        }
        else {
            return false;
        }
    }
    get(key) {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            this.heap.increment(foundElem.linkToHeap);
            return foundElem.data;
        }
        else {
            return null;
        }
    }
    delete(key) {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            clearTimeout(foundElem.timeout);
            this.heap.delete(foundElem.linkToHeap);
            this.searcher.delete(key);
        }
        return true;
    }
    has(key) {
        return this.searcher.has(key);
    }
    clear() {
        this.setSize(0);
    }
    updateTtl(key, ttl) {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            clearTimeout(foundElem.timeout);
            if (ttl > 0) {
                foundElem.timeout = setTimeout(() => {
                    this.delete(key);
                });
            }
        }
        else {
            return false;
        }
    }
    getSize() {
        return this.heap.getCount();
    }
    getMaxSize() {
        return this.heap.getMaxCount();
    }
    setSize(size) {
        let rejectedArray = this.heap.setMaxSize(size);
        rejectedArray.forEach(arrayElement => {
            let foundElem = this.searcher.get(arrayElement.key);
            if (foundElem) {
                clearTimeout(foundElem.timeout);
                this.searcher.delete(arrayElement.key);
            }
        });
    }
    getSizeObject() {
        return {
            currentSize: this.heap.getCount(),
            maxSize: this.heap.getMaxCount()
        };
    }
}
exports.LfuCache = LfuCache;
