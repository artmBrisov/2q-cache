# 2Q cache

Implementation of 2Q (Double Queues) Cache Algorithm.
2Q demonstrates better cache hit than the most popular LRU (Last Recently Used) cache.

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
    stringKeys : true // If stringKeys are true, keys of cache elements will be convert to string by JSON.stringify
}

let cache = new Cache2Q(400, options);

```

By default
*  `cache ttl equals 0, so elements will not be removed by ttl`
*  `stringKeys are false, so new elements are saving "as is", without using JSON.stringify`



You also can use Typescript version of 2Q cache module:

```typescript
import {Cache2Q, CacheException} from '2q-cache/ts/cache2Q';

let cache : Cache2Q = new Cache2Q(400); 
```

## API

* `set(key : any, value : any, ttl : number = 0)`

    if key exists, it updates value and ttl
    parameter ttl overrides default ttl settings

* `mset(Array<object {key : any, value : any, ttl : number = 0}>)`

    the same as 'set', but for array of new elements

* `get(key) => value`

    if key doesn't exists, returns null

* `mget(Array<key : any>) : Array<values : any>`

    the same as 'get', but for array of keys

* `has(key) => boolean`

    Returns true/false without moving element in cache

* `mhas(Array<key : any>) : Array<boolean>`

    the same as 'has', but for array of keys

* `delete(key : any) => boolean`

    deletes pair (key, value) from cache.
    If element doesn't exist, returns false.

* `mdel(keys : Array<any>) : Array<boolean>`

    the same as 'del', but for array of keys

* `resetTtl(key : any, ttl : number)`

    resets ttl for element by presented key. Overrides default ttl settings

* `mresetTtl(keys : Array<object {key : any, ttl : number}>)`

    the same as 'resetTtl', but for array of keys

* `setDefaultTtl(ttl : number)`

    sets default ttl. New ttl will not be default ttl for already exists objects in cache 

* `setStringifyKeys(param : boolean)`

    overrides default setting for stringify keys

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

* `Add ability to select type of cache in "main" section from LRU, MRU, LFU caches`
* `Any other ideas?`