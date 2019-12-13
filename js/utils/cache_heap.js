"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CacheHeap {
    constructor(maxCount) {
        this.count = 0;
        this.data = new Array(maxCount);
        this.maxCount = maxCount;
        this.count = 0;
    }
    setMaxSize(size) {
        this.maxCount = size;
        let newData = new Array(this.maxCount);
        this.count = 0;
        for (let i = 0; i < Math.min(this.data.length, newData.length); i++) {
            if (this.data[i]) {
                newData[i] = this.data[i];
            }
            else {
                break;
            }
        }
        let unusedElements = [];
        if (this.data.length > newData.length) {
            for (let i = newData.length; i < this.data.length; i++) {
                unusedElements.push(this.data[i]);
            }
        }
        this.data = newData;
        return unusedElements;
    }
    insert(elem) {
        this.count++;
        if (this.count > this.maxCount) {
            this.count--;
            let oldMin = this.data[0];
            this.data[0] = elem;
            elem.index = 0;
            this.siftDown(0);
            return oldMin;
        }
        else {
            elem.index = this.count - 1;
            this.data[this.count - 1] = elem;
            this.siftUp(this.count - 1);
            return null;
        }
    }
    increment(elem) {
        let i = elem.index;
        this.data[i].count++;
        this.siftDown(i);
    }
    delete(elem) {
        let i = elem.index;
        this.data[i].key = Infinity;
        let pos = this.siftDown(i);
        let elemToDelete = this.data[pos];
        this.data[pos] = undefined;
        if (this.data[pos + 1] != undefined) {
            this.swap(pos, pos + 1);
        }
        this.count--;
        return elemToDelete;
    }
    siftDown(pos) {
        let i = pos;
        while (2 * i + 1 < this.count) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let j = left;
            if ((right < this.count) && (this.data[left].count > this.data[right].count)) {
                j = right;
            }
            if (this.data[i].count <= this.data[j].count)
                break;
            this.swap(i, j);
            i = j;
        }
        return i;
    }
    siftUp(pos) {
        let i = pos;
        while ((i != 0)
            && (this.data[i].count < this.data[Math.floor((i - 1) / 2)].count)) {
            this.swap(i, Math.floor((i - 1) / 2));
            i = Math.floor((i - 1) / 2);
        }
        return i;
    }
    swap(first, second) {
        this.data[first].index = second;
        this.data[second].index = first;
        let temp = this.data[first];
        this.data[first] = this.data[second];
        this.data[second] = temp;
    }
    toStringKeys() {
        let keys = [];
        for (let i = 0; i < this.count; i++) {
            keys.push(this.data[i].key);
        }
        return keys.join(" ");
    }
    getCount() {
        return this.count;
    }
    getMaxCount() {
        return this.maxCount;
    }
}
exports.CacheHeap = CacheHeap;
