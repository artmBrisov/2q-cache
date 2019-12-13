"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BucketsTransportObject {
}
exports.BucketsTransportObject = BucketsTransportObject;
class CacheMapElem {
    constructor() {
        this.timeout = undefined;
        this.data = null;
    }
}
exports.CacheMapElem = CacheMapElem;
class CacheQueueElem {
    constructor() {
        this.key = null;
        this.next = null;
        this.prev = null;
    }
}
exports.CacheQueueElem = CacheQueueElem;
class CacheQueueHead {
    constructor() {
        this.next = null;
    }
}
exports.CacheQueueHead = CacheQueueHead;
class LfuMapElem {
    constructor() {
        this.timeout = undefined;
        this.data = null;
    }
}
exports.LfuMapElem = LfuMapElem;
class CacheHeapElem {
    constructor() {
        this.key = null;
        this.count = 0;
        this.index = -1;
    }
}
exports.CacheHeapElem = CacheHeapElem;
