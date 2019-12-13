"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_objects_1 = require("./cache_objects");
class CacheQueue {
    constructor(max_count) {
        this.maxCount = max_count;
        this.count = 0;
        this.head = new cache_objects_1.CacheQueueHead();
        this.last = null;
    }
    isFull() {
        return this.count >= this.maxCount;
    }
    setSize(size) {
        this.maxCount = size;
    }
    unshift(elem) {
        let oldHead = this.head.next;
        if (oldHead) {
            oldHead.prev = elem;
        }
        elem.next = oldHead;
        this.head.next = elem;
        this.count++;
        if (this.count > this.maxCount) {
            if (this.last !== null) {
                this.last = this.last.prev;
                this.count--;
                return this.unlink(this.last.next);
            }
        }
        return null;
    }
    push(elem) {
        if (this.head.next === null) {
            this.head.next = elem;
            this.last = elem;
        }
        else {
            this.last.next = elem;
            elem.prev = this.last;
            this.last = elem;
        }
        this.count++;
        if (this.count > this.maxCount) {
            this.count--;
            let elemToPop = this.head.next;
            this.head.next = this.head.next.next;
            if (this.count > 0) {
                this.head.next.prev = null;
            }
            return elemToPop;
        }
        return null;
    }
    unlink(elem) {
        this.count--;
        if (elem.prev != null) {
            elem.prev.next = elem.next;
        }
        if (elem.next != null) {
            elem.next.prev = elem.prev;
        }
        elem.prev = null;
        elem.next = null;
        return elem;
    }
    pop() {
        return this.unlink(this.head.next);
    }
    clear() {
        this.head.next = null;
        this.last = null;
        this.count = 0;
    }
    getSize() {
        return this.count;
    }
    getMaxSize() {
        return this.maxCount;
    }
}
exports.CacheQueue = CacheQueue;
