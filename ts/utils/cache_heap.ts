import { CacheHeapElem} from "./cache_objects";

export class CacheHeap {
    private count : number = 0;
    private maxCount : number;

    private data : Array<CacheHeapElem>;

    constructor(maxCount : number) {
        this.data = new Array(maxCount);
        this.maxCount = maxCount;
        this.count = 0;
    }

    setMaxSize(size : number) : Array<CacheHeapElem> {
        this.maxCount = size;
        let newData = new Array(this.maxCount);
        this.count = 0;
        for (let i = 0; i < Math.min(this.data.length, newData.length); i++) {
            if (this.data[i]) {
                newData[i] = this.data[i];
            } else {
                break;
            }
        }
        let unusedElements : Array<CacheHeapElem> = [];

        if (this.data.length > newData.length) {
            for (let i = newData.length; i < this.data.length; i++) {
                unusedElements.push(this.data[i]);
            }
        }

        this.data = newData;
        return unusedElements;
    }

    insert(elem : CacheHeapElem) : CacheHeapElem {
        this.count++;
        if (this.count > this.maxCount) {
            this.count--;
            let oldMin = this.data[0];
            this.data[0] = elem;
            elem.index = 0;
            this.siftDown(0);
            return oldMin;
        } else {
            elem.index = this.count - 1;
            this.data[this.count - 1] = elem;
            this.siftUp(this.count - 1);
            return null;
        }
    }

    increment(elem : CacheHeapElem) : void {
        let i : number = elem.index;
        this.data[i].count++;
        this.siftDown(i);
    }

    delete(elem : CacheHeapElem) : CacheHeapElem {
        let i : number = elem.index;
        this.data[i].count = Infinity;
        let pos = this.siftDown(i);
        let elemToDelete = this.data[pos];
        this.data[pos] = undefined;
        if (this.data[pos + 1] != undefined) {
            this.swap(pos, pos + 1);
        }
        this.count--;
        return elemToDelete;
    }

    private siftDown(pos : number) : number {
        let i : number = pos;
        while (2 * i + 1 < this.count) {
            let left : number = 2 * i + 1;
            let right : number = 2 * i + 2;

            let j = left;

            if ((right < this.count) && (this.data[left].count > this.data[right].count)) {
                j = right;
            } 
            if (this.data[i].count <= this.data[j].count) break;
            this.swap(i, j);
            i = j;
        }
        return i;
    }

    private siftUp(pos : number) : number {
        let i : number = pos;
        while ((i != 0)
                && (this.data[i].count < this.data[Math.floor((i - 1) / 2)].count)
        ) {
            this.swap(i, Math.floor((i - 1) / 2));
            i = Math.floor((i - 1) / 2);
        }
        return i;
    }

    private swap(first : number, second : number) : void {
        this.data[first].index = second;
        this.data[second].index = first;
        let temp : CacheHeapElem = this.data[first];
        this.data[first] = this.data[second];
        this.data[second] = temp;
    }

    toStringKeys() : String {
        let keys = [];
        for (let i = 0; i < this.count; i++) {
            keys.push(this.data[i].key);
        }
        return keys.join(" ");
    }

    getData() : object {
        let dataArray = [];
        this.data.forEach((elem) => {
            dataArray.push(elem.key);
        })
        return {
            data : this.data,
            count : this.count,
            maxCount : this.maxCount
        }
    }

    getCount() {
        return this.count;
    }

    getMaxCount() {
        return this.maxCount;
    }
}