import { Cache } from "./cache";

import { CacheQueue } from "../utils/cache_queue";
import { CacheQueueElem, CacheMapElem } from "../utils/cache_objects";

export class SimpleCache implements Cache {

    private searcher : Map<any, CacheMapElem>;
    private queue : CacheQueue;

    private type : string;

    constructor(size, type : string = "lru") {
        this.type = type;
        this.searcher = new Map();
        this.queue = new CacheQueue(size);
    }

    public set(key : any, value : any, ttl : number = 0) : boolean {

        let newQueueElem = new CacheQueueElem();
        newQueueElem.key = key;

        let newMapElem = new CacheMapElem();
        newMapElem.bucket = 2;
        newMapElem.linkToList = newQueueElem;
        newMapElem.data = value;

        let repressedElem = this.type === "lru" ? this.queue.push(newQueueElem) 
                :this.queue.unshift(newQueueElem);
            
        this.searcher.set(key, newMapElem);

        if (ttl > 0) {
            newMapElem.timeout = setTimeout(() => {
                if (this.has(key)) this.delete(key)
            }, ttl)
        }

        if (repressedElem != null) {
            this.searcher.delete(repressedElem.key);
        }

        return true;
    }

    public get(key : any) : any {
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
            clearTimeout(elemToDelete.timeout);
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
        this.searcher.forEach(value => {
            clearTimeout(value.timeout);
        })
        this.searcher.clear();
        this.queue.clear();
    }

    public update(key : any, value : any, ttl : number = 0) : boolean {
        let mapElem = this.searcher.get(key);
        clearTimeout(mapElem.timeout);
        if (ttl > 0) {
            mapElem.timeout = setTimeout(() => {
                this.delete(key);
            }, ttl) 
        }
        mapElem.data = value;
        return true;
    }

    updateTtl(key : any, ttl : number = 0) : boolean {
        let mapElem = this.searcher.get(key);
        clearTimeout(mapElem.timeout);
        if (ttl > 0) {
            mapElem.timeout = setTimeout(() => {
                this.delete(key);
            }, ttl)
        }
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

    getData() : object {
        return {
            searcher : this.searcher,
            data : this.queue.getData()
        }
    }

}