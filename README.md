# 2Q cache

Implementation of 2Q (Double Queues) Cache Algorithm.
2Q demonstrates better cache hit than the most popular LRU (Last Recently Used) cache

## Installation:

```javascript
npm i 2q-cache
```

## Usage:

```javascript
const Cache2Q = require('./2q-cache/');

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

You also can use Typescript version of 2Q cache module:

```typescript
import {Cache2Q} from './2q-cache/ts/cache2Q';

let cache : Cache2Q = new Cache2Q(400); 
```

## API

* `set(key, value)`

    if key exists, it updates value

* `get(key) => value`

    if key doesn't exists, returns null

* `has(key)`

    Returns true/false without moving element in cache

* `clear()` 

    Clear cache

* `alloc(size : number | Array<number>)`

    Sets new size for each cache section. Parameter same as constructor parameter .Doesn't allow make max section size smaller

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

* `Make Tests`
* `Add ability to select type of cache in "main" section from LRU, MRU, LFU caches`