import { CacheQueue } from "./cache_queue";
import { CacheMapElem, CacheQueueElem, BucketsTransportObject } from "./cache_objects";

export class CacheBuckets {

    private in : CacheQueue;
    private out : CacheQueue;

    private searcher : Map<any, CacheMapElem>;

    constructor(inSize, outSize) {
        this.in = new CacheQueue(inSize);
        this.out = new CacheQueue(outSize);

        this.searcher = new Map();
    }

    public set(key : any, value : any) : boolean {
        let oldMapElem = this.searcher.get(key);
        if (!oldMapElem) {
            let newQueueElem = new CacheQueueElem();
            newQueueElem.key = key;
    
            let newMapElem = new CacheMapElem();
            newMapElem.bucket = 0;
            newMapElem.linkToList = newQueueElem;
            newMapElem.data = value;
    
            let repressedElem =  this.in.push(newQueueElem);
            this.pushToOut(repressedElem);

            this.searcher.set(key, newMapElem);
        } else {
            oldMapElem.data = value;
            this.searcher.set(key, oldMapElem);
        }
        return true;
    }

    private pushToOut(elem : CacheQueueElem) : void {
        if (elem != null) {
            this.searcher.get(elem.key).bucket = 1;
            let repressedElem =  this.out.push(elem);
            if (repressedElem != null) {
                this.searcher.delete(repressedElem.key);                
            }
        }
    }

    public get(key : any) : BucketsTransportObject {
        let foundElem = this.searcher.get(key);
        if (foundElem) {
            let transport = new BucketsTransportObject();
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

    public has(key : any) : boolean {
        return this.searcher.has(key);
    }

    public clear() : void {
        this.searcher.clear();
        this.in.clear();
        this.out.clear();
    }

    public delete(key : any) : boolean {
        let delObject = this.searcher.get(key);
        if (delObject.bucket === 0) {
            this.in.unlink(delObject.linkToList);
            this.searcher.delete(key);
        } else {
            this.out.unlink(delObject.linkToList);
            this.searcher.delete(key);
        }

        return true;
    }

    public getSize() : Array<number> {
        return [
            this.in.getSize(),
            this.out.getSize()
        ];
    }

    public getMaxSize() : Array<number> {
        return [
            this.in.getMaxSize(),
            this.out.getMaxSize()
        ];
    }

    public getSizeObject() : object {
        return {
            in : {
                currentSize : this.in.getSize(),
                maxSize : this.in.getMaxSize()
            },
            out : {
                currentSize : this.out.getSize(),
                maxSize : this.out.getMaxSize()
            }
        }
    }

    public setSize(inSize : number, outSize : number) {
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