export class BucketsTransportObject {
    public key : any;
    public value : any;
    public needMove : boolean;
    public timeout : number;
}

export class CacheMapElem {
    public timeout : number = undefined;
    public linkToList : CacheQueueElem;
    public bucket : number;
    public data : any = null;
}

export class CacheQueueElem {
    public key : any = null;
    public next : CacheQueueElem = null;
    public prev : CacheQueueElem = null;
}

export class CacheQueueHead {
    public data : null;
    public next : CacheQueueElem = null;
}

export class LfuMapElem {
    public timeout : number = undefined;
    public linkToHeap : CacheHeapElem;
    public bucket : number;
    public data : any = null;
}

export class CacheHeapElem {
    public key : any = null;
    public count : number = 0;
    public index : number = -1;
}