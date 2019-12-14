import { CacheQueueHead, CacheQueueElem } from "./cache_objects";

export class CacheQueue {

    private head : CacheQueueHead;
    private last : CacheQueueElem;

    private count : number;
    private maxCount : number;

    constructor(max_count) {
        this.maxCount = max_count;
        this.count = 0;
        this.head = new CacheQueueHead();
        this.last = null;
    }

    isFull() : boolean {
        return this.count >= this.maxCount;
    }

    setSize(size : number) {
        this.maxCount = size;
    }

    unshift(elem : CacheQueueElem) : CacheQueueElem {
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

    push(elem : CacheQueueElem) : CacheQueueElem {
        if (this.head.next === null) {
            this.head.next = elem;
            this.last = elem;
        } else {
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

    unlink(elem : CacheQueueElem) : CacheQueueElem {
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

    getData() {
        let dataArray : Array<any> = [];
        let cursor = this.head.next;
        while (cursor != null) {
            dataArray.push(cursor.key);
            cursor = cursor.next;
        }
        return {
            data : dataArray,
            count : this.count,
            maxCount : this.maxCount
        }
    }

}