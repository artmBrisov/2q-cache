export interface Cache {
    set(key : any, value : any, ttl : number) : boolean;
    update(key : any, value : any, ttl : number);
    get(key : any) : any;
    delete(key : any) : boolean;
    has(key : any) : boolean;
    clear() : void;
    updateTtl(key : any, ttl : number | never) : boolean;
    getSize() : number;
    getMaxSize() : number;
    setSize(size : number) : void;
    getSizeObject() : object;
    getData() : object;
}