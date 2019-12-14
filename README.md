# 2Q cache

Simple and configurable cache library for Node.js and Browser that implements 2Q Cache algorithm (http://www.vldb.org/conf/1994/P439.PDF)
This algorithm tries to preserve the most used elements, so it demonstrates better cache hit than other caches,for example, LRU (Least Recently Used) cache.
## Installation:

```
npm i 2q-cache
```

## Usage:

```javascript
const Cache2Q = require('2q-cache');

let cache = new Cache2Q(400); //sets max count of cache elems
/*
    20% of size will be "in" FIFO bucket,
    60% - "out" FIFO bucket,
    20% - "main" LRU cache

    OR

    let cache = new Cache2Q[400, 440, 200] - you also can define manually sizes of each section in cache.
    First element of array is size of "in" FIFO bucket,
    Second - size of "out" FIFO bucket,
    Third - size of "main" LRU cache
*/
```

Example with options

```javascript
const Cache2Q = require('2q-cache');

let options = {
    ttl : 1000 * 60 * 60, //default time to delete elements from cache : number
    stringKeys : true, // If stringKeys are true, keys of cache elements will be convert to string by JSON.stringify
    ttlInMain : false, //you can disable time to delete in 'main' section of cache. It can be useful, because in main                           //section stored most requested cache elements
    mainStorageType : 'lfu' //Type of main storage. It can be 'lru' - Least Recently Used,
                            //'mru' - Most Recently used,
                            //'lfu' - Least-Frequently used
}

let cache = new Cache2Q(400, options); //or ([100,200,250], options);

```

By default
*  `cache ttl (lifetime) equals 0, so elements will not be removed by timeout`
*  `stringKeys are false, so new elements are saving "as is", without using JSON.stringify`



You also can use Typescript version of 2Q cache module:

```typescript
import {Cache2Q, CacheException} from '2q-cache/ts/cache2Q';

let cache : Cache2Q = new Cache2Q(400); 
```

## API

* `set(key : any, value : any, ttl : number = 0 (optional))`

    Sets new pair (key, value) with lifetime (optional)
    if key exists, it updates value and ttl
    parameter ttl overrides default ttl settings

* `mset(Array<object {key : any, value : any, ttl : number = 0}>)`

    the same as 'set', but for array of new elements

* `get(key) => value`

    Returns value by presented key
    if key doesn't exists, returns null

* `mget(Array<key : any>) : Array<values : any>`

    the same as 'get', but for array of keys

* `has(key) => boolean`

    Returns true if key exists, otherwise returns false

* `mhas(Array<key : any>) : Array<boolean>`

    the same as 'has', but for array of keys

* `delete(key : any) => boolean`

    deletes pair (key, value) from cache.
    If element doesn't exists, returns false.

* `mdel(keys : Array<any>) : Array<boolean>`

    the same as 'del', but for array of keys

* `resetTtl(key : any, ttl : number)`

    resets (overrides) ttl for element by presented key.

* `mresetTtl(keys : Array<object {key : any, ttl : number}>)`

    the same as 'resetTtl', but for array of keys

* `setDefaultTtl(ttl : number)`

    sets default ttl.

* `setStringifyKeys(param : boolean)`

    overrides default setting for stringify keys.
    if stringify keys are true, keys will be converted to string by JSON.stringify

* `clear()` 

    Clears cache

* `alloc(size : number | Array<number>)`

    Sets new size for each cache section. Parameter same as constructor parameter. Doesn't allow make max section size smaller

* `allocUnsafe(size : number | Array<number>)`

    Sets new size for each cache section. Parameter same as constructor parameter . Allow make max section size smaller.
    If new max size smaller than current size on some cache section, older elements will be removed.

* `getSize()`

    Returns object like this:

```javascript
    {
        buckets : {
            in : {
                currentSize : 10,
                maxSize : 20
            },
            out : {
                currentSize : 0,
                maxSize : 60
            },
        },
        main : {
            currentSize : 0,
            maxSize : 20
        }
    }
```

## ROADMAP

* `Any ideas?`