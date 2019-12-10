"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_queue_1 = require("./cache_queue");
const cache_objects_1 = require("./cache_objects");
class CacheBuckets {
    constructor(inSize, outSize) {
        this.in = new cache_queue_1.CacheQueue(inSize);
        this.out = new cache_queue_1.CacheQueue(outSize);
        this.searcher = new Map();
    }
    set(key, value) {
        let oldMapElem = this.searcher.get(key);
        if (!oldMapElem) {
            let newQueueElem = new cache_objects_1.CacheQueueElem();
            newQueueElem.key = key;
            let newMapElem = new cache_objects_1.CacheMapElem();
            newMapElem.bucket = 0;
            newMapElem.linkToList = newQueueElem;
            newMapElem.data = value;
            let repressedElem = this.in.push(newQueueElem);
            this.pushToOut(repressedElem);
            this.searcher.set(key, newMapElem);
        }
        else {
            oldMapElem.data = value;
            this.searcher.set(key, oldMapElem);
        }
        return true;
    }
    pushToOut(elem) {
        if (elem != null) {
            this.searcher.get(elem.key).bucket = 1;
            let repressedElem = this.out.push(elem);
            if (repressedElem != null) {
                this.searcher.delete(repressedElem.key);
            }
        }
    }
    get(key) {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            let transport = new cache_objects_1.BucketsTransportObject();
            transport.key = key;
            transport.value = foundElem.data;
            let bucket = foundElem.bucket;
            if (bucket === 1) {
                this.out.unlink(foundElem.linkToList);
                this.searcher.delete(key);
                transport.needMove = true;
            }
            return transport;
        }
        return null;
    }
    has(key) {
        return this.searcher.has(key);
    }
    clear() {
        this.searcher.clear();
        this.in.clear();
        this.out.clear();
    }
    delete(key) {
        let delObject = this.searcher.get(key);
        if (delObject.bucket === 0) {
            this.in.unlink(delObject.linkToList);
            this.searcher.delete(key);
        }
        else {
            this.out.unlink(delObject.linkToList);
            this.searcher.delete(key);
        }
        return true;
    }
    getSize() {
        return [
            this.in.getSize(),
            this.out.getSize()
        ];
    }
    getMaxSize() {
        return [
            this.in.getMaxSize(),
            this.out.getMaxSize()
        ];
    }
    getSizeObject() {
        return {
            in: {
                currentSize: this.in.getSize(),
                maxSize: this.in.getMaxSize()
            },
            out: {
                currentSize: this.out.getSize(),
                maxSize: this.out.getMaxSize()
            }
        };
    }
    setSize(inSize, outSize) {
        this.in.setSize(inSize);
        while (this.in.getSize() > this.in.getMaxSize()) {
            let deletedElem = this.in.pop();
            this.searcher.delete(deletedElem.key);
        }
        this.out.setSize(outSize);
        while (this.out.getSize() > this.out.getMaxSize()) {
            let deletedElem = this.out.pop();
            this.searcher.delete(deletedElem.key);
        }
    }
}
exports.CacheBuckets = CacheBuckets;
