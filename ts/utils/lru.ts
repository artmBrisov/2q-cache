import { CacheQueue } from "./cache_queue";
import { CacheQueueElem, CacheMapElem } from "./cache_objects";

export class LruCache {

    private searcher : Map<any, CacheMapElem>;
    private queue : CacheQueue;

    constructor(size) {
        this.searcher = new Map();
        this.queue = new CacheQueue(size);
    }

    public set(key : any, value : any) : boolean {

        let newQueueElem = new CacheQueueElem();
        newQueueElem.key = key;

        let newMapElem = new CacheMapElem();
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

    public get(key : any) : object {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            let foundListElem = foundElem.linkToList;
            this.queue.push(this.queue.unlink(foundListElem));
            return foundElem.data;
        } else {
            return null;
        }
    }

    public delete(key : any) : boolean {
        let elemToDelete = this.searcher.get(key);
        if (elemToDelete) {
            this.searcher.delete(key);
            this.queue.unlink(elemToDelete.linkToList);
            elemToDelete.linkToList = null;
            return true;
        } else {
            return false;
        }
    }

    public has(key : any) : boolean {
        return this.searcher.has(key);
    }

    public clear() {
        this.searcher.clear();
        this.queue.clear();
    }

    public update(key : any, value : any) : boolean {
        let mapElem = this.searcher.get(key);
        mapElem.data = value;
        return true;
    }

    getSize() : number {
        return this.queue.getSize();
    }

    getMaxSize() : number {
        return this.queue.getMaxSize();
    }

    getSizeObject() : object {
        return {
            currentSize : this.queue.getSize(),
            maxSize : this.queue.getMaxSize()
        }
    }

    setSize(number : number) {
        this.queue.setSize(number);
        while (this.queue.getSize() > this.queue.getMaxSize()) {
            let deletedElem = this.queue.pop();
            this.searcher.delete(deletedElem.key);
        }
    }

}