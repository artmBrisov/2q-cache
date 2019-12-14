"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_queue_1 = require("../utils/cache_queue");
const cache_objects_1 = require("../utils/cache_objects");
class SimpleCache {
    constructor(size, type = "lru") {
        this.type = type;
        this.searcher = new Map();
        this.queue = new cache_queue_1.CacheQueue(size);
    }
    set(key, value, ttl = 0) {
        let newQueueElem = new cache_objects_1.CacheQueueElem();
        newQueueElem.key = key;
        let newMapElem = new cache_objects_1.CacheMapElem();
        newMapElem.bucket = 2;
        newMapElem.linkToList = newQueueElem;
        newMapElem.data = value;
        let repressedElem = this.type === "lru" ? this.queue.push(newQueueElem)
            : this.queue.unshift(newQueueElem);
        this.searcher.set(key, newMapElem);
        if (ttl > 0) {
            newMapElem.timeout = setTimeout(() => {
                if (this.has(key))
                    this.delete(key);
            }, ttl);
        }
        if (repressedElem != null) {
            this.searcher.delete(repressedElem.key);
        }
        return true;
    }
    get(key) {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            let foundListElem = foundElem.linkToList;
            this.queue.push(this.queue.unlink(foundListElem));
            return foundElem.data;
        }
        else {
            return null;
        }
    }
    delete(key) {
        let elemToDelete = this.searcher.get(key);
        if (elemToDelete) {
            clearTimeout(elemToDelete.timeout);
            this.searcher.delete(key);
            this.queue.unlink(elemToDelete.linkToList);
            elemToDelete.linkToList = null;
            return true;
        }
        else {
            return false;
        }
    }
    has(key) {
        return this.searcher.has(key);
    }
    clear() {
        this.searcher.forEach(value => {
            clearTimeout(value.timeout);
        });
        this.searcher.clear();
        this.queue.clear();
    }
    update(key, value, ttl = 0) {
        let mapElem = this.searcher.get(key);
        clearTimeout(mapElem.timeout);
        if (ttl > 0) {
            mapElem.timeout = setTimeout(() => {
                this.delete(key);
            }, ttl);
        }
        mapElem.data = value;
        return true;
    }
    updateTtl(key, ttl = 0) {
        let mapElem = this.searcher.get(key);
        clearTimeout(mapElem.timeout);
        if (ttl > 0) {
            mapElem.timeout = setTimeout(() => {
                this.delete(key);
            }, ttl);
        }
        return true;
    }
    getSize() {
        return this.queue.getSize();
    }
    getMaxSize() {
        return this.queue.getMaxSize();
    }
    getSizeObject() {
        return {
            currentSize: this.queue.getSize(),
            maxSize: this.queue.getMaxSize()
        };
    }
    setSize(number) {
        this.queue.setSize(number);
        while (this.queue.getSize() > this.queue.getMaxSize()) {
            let deletedElem = this.queue.pop();
            this.searcher.delete(deletedElem.key);
        }
    }
    getData() {
        return {
            searcher: this.searcher,
            data: this.queue.getData()
        };
    }
}
exports.SimpleCache = SimpleCache;
