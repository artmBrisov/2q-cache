export class BucketsTransportObject {
    public key : any;
    public value : any;
    public needMove : boolean;
}

export class CacheMapElem {
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