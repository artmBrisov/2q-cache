"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_queue_1 = require("./cache_queue");
const cache_objects_1 = require("./cache_objects");
class LruCache {
    constructor(size) {
        this.searcher = new Map();
        this.queue = new cache_queue_1.CacheQueue(size);
    }
    set(key, value) {
        let newQueueElem = new cache_objects_1.CacheQueueElem();
        newQueueElem.key = key;
        let newMapElem = new cache_objects_1.CacheMapElem();
        newMapElem.bucket = 2;
        newMapElem.linkToList = newQueueElem;
        newMapElem.data = value;
        let repressedElem = this.queue.push(newQueueElem);
        this.searcher.set(key, newMapElem);
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
        this.searcher.clear();
        this.queue.clear();
    }
    update(key, value) {
        let mapElem = this.searcher.get(key);
        mapElem.data = value;
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
}
exports.LruCache = LruCache;
