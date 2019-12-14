process.env.NODE_ENV = 'test';

const cacheConstructor = require('../index');
const CacheException = require('../js/cache2Q').CacheException;

const CacheHeap = require('../js/utils/cache_heap').CacheHeap;

describe("construct", function() {
    it("init cache with size 200",function () {

        let e_in = 40;
        let e_out = 120;
        let e_main = 40;
    
        let cache = new cacheConstructor(200);
        let info = cache.getSize();
    
        let a_in = info.buckets.in.maxSize, 
                a_out = info.buckets.out.maxSize, 
                        a_main = info.main.maxSize;
        if (!((e_in === a_in) && (e_out === a_out) && (e_main === a_main))) {
            throw new Error("Unexpected sizes");
        }
    })

    it("init cache with size [40,40,45]",function () {

        let e_in = 40;
        let e_out = 40;
        let e_main = 45;
    
        let cache = new cacheConstructor([40, 40, 45]);
        let info = cache.getSize();
    
        let a_in = info.buckets.in.maxSize, 
                a_out = info.buckets.out.maxSize, 
                        a_main = info.main.maxSize;
        if (!((e_in === a_in) && (e_out === a_out) && (e_main === a_main))) {
            throw new Error("Unexpected sizes");
        }
    })

    it("try to init cache with 0 size",function () {
        try {
            let cache = new cacheConstructor(0);
        } catch(e) {
            if (!(e instanceof CacheException))  {
                throw new Error("Error didn't thrown");
            }
        }
    })

    it("Init cache with negative size",function () {
        let e_in = 40;
        let e_out = 40;
        let e_main = 45;
    
        let cache = new cacheConstructor([-40, -40, -45]);
        let info = cache.getSize();
    
        let a_in = info.buckets.in.maxSize, 
                a_out = info.buckets.out.maxSize, 
                        a_main = info.main.maxSize;
        if (!((e_in === a_in) && (e_out === a_out) && (e_main === a_main))) {
            throw new Error("Unexpected sizes");
        }
    })
})

describe("set, get, alloc",function() {
    let cache = new cacheConstructor(200);
  
    let getCacheIn = () => {
        let arr = [];
        let cursor = cache.buckets.in.head.next;
        while (cursor != null) {
            arr.push(cursor.key);
            cursor = cursor.next;
        }
        return arr;
    }

    it("sets values to cache",function() {
        for (let i = 0; i < 150; i++) {
            cache.set(i, i);
        }

        let exprectedIn = []

        for (let i = 110; i < 150; i++) {
            exprectedIn.push(i);
        }

        let actualIn = getCacheIn();

        if (JSON.stringify(exprectedIn) !== JSON.stringify(actualIn)) {
            console.log(JSON.stringify(exprectedIn));
            console.log(JSON.stringify(actualIn));
            throw new Error('Unexpected "in" bucket');
        }
    })

    it("gets some values in 'in' from cache",function() {
        let expectedRes = [];
        for (let i = 110; i < 150; i++) {
            expectedRes.push(i);
        }

        let actualRes = [];
        for (let i = 110; i < 150; i++) {
            actualRes.push(cache.get(i));
        }

        if (JSON.stringify(expectedRes) !== JSON.stringify(actualRes)) {
            console.log(JSON.stringify(expectedRes));
            console.log(JSON.stringify(actualRes));
            throw new Error('Unexpected get results');
        }

        if (cache.getSize().main.currentSize !== 0) {
            throw new Error("Unexpected elements in main")
        }
    })

    it("get some values in 'out' from cache", function() {
        let expectedRes = [];
        for (let i = 60; i < 70; i++) {
            expectedRes.push(i);
        }

        let actualRes = [];
        for (let i = 60; i < 70; i++) {
            actualRes.push(cache.get(i));
        }

        if (JSON.stringify(expectedRes) !== JSON.stringify(actualRes)) {
            console.log(JSON.stringify(expectedRes));
            console.log(JSON.stringify(actualRes));
            throw new Error('Unexpected get results');
        }

        if (cache.getSize().main.currentSize !== 10) {
            console.log(cache.getSize().main.currentSize);
            throw new Error("Unexpected elements in main")
        }
    }) 

    it("has some values in 'out' from cache", function() {
        let expectedRes = [];
        for (let i = 60; i < 70; i++) {
            expectedRes.push(true);
        }

        let actualRes = [];
        for (let i = 60; i < 70; i++) {
            actualRes.push(cache.has(i));
        }

        if (JSON.stringify(expectedRes) !== JSON.stringify(actualRes)) {
            console.log(JSON.stringify(expectedRes));
            console.log(JSON.stringify(actualRes));
            throw new Error('Unexpected get results');
        }

    })
    
    it("has not some values in 'out' from cache", function() {
        let expectedRes = [];
        for (let i = 60; i < 70; i++) {
            expectedRes.push(false);
        }

        let actualRes = [];
        for (let i = 3360; i < 3370; i++) {
            actualRes.push(cache.has(i));
        }

        if (JSON.stringify(expectedRes) !== JSON.stringify(actualRes)) {
            console.log(JSON.stringify(expectedRes));
            console.log(JSON.stringify(actualRes));
            throw new Error('Unexpected get results');
        }

    })
    
    it("change some value", function() {
        let outLen = cache.getSize().buckets.out.currentSize;
        cache.set(50,10000);
        let newOutLen = cache.getSize().buckets.out.currentSize;
        if (cache.get(50) != 10000 || outLen != newOutLen) {
            throw new Error('Unexpected results');
        }
    })

    it("delete some value", function() {
        cache.delete(50);
        if (cache.get(50) != null) {
            throw new Error('Unexpected results');
        }
    })

    it("reallocate", function() {
        let [c_in, c_out, c_main] = [cache.getSize().buckets.in.currentSize, 
                cache.getSize().buckets.out.currentSize,
                        cache.getSize().main.currentSize]
        cache.alloc(400);
        let size = cache.getSize();
        if ((size.buckets.in.maxSize != 80) || (size.buckets.out.maxSize != 240) || (size.main.maxSize) != 80) {
            if ((c_in != size.buckets.in.currentSize) 
                    || (c_out != size.buckets.out.currentSize) || (c_main != size.buckets.main.currentSize)) {
                        throw new Error("Unexpected reallocate results");
            }   
            throw new Error("Unexpected reallocate results");
        }
    })

    it ("unsafe reallocate", function() {
        cache.allocUnsafe([20, 40, 20]);
        let size = cache.getSize();
        if ((size.buckets.in.maxSize != 20) || (size.buckets.out.maxSize != 40) || (size.main.maxSize) != 20) {
            throw new Error("Unexpected reallocate results");
        }
    })

    it("Not allowed reallocate", function() {
        try {
            cache.alloc(10);
            throw new Error("Unexpected Result")
        } catch(e) {
            if (!(e instanceof CacheException)) {
                throw e;
            }
        }
    })

})

describe("test for 1.1.0 methods",function() {

    let asyncTimeout = async (timeout, callback) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                callback() ? resolve() : reject();
            }, timeout)
        })
    }

    describe("mset, mget, mhas, mdel etc...", function() {
        let cache = new cacheConstructor(10);

        it("mset && mhas", function() {
            cache.mset([{key : 11, value : 11, ttl : 0}, {key : 12, value : 12, ttl : 1000 * 15}]);
            if (JSON.stringify(cache.mhas([11, 11])) === JSON.stringify([true, true])) {
                cache.clear();
            } else {
                throw new Error("Unsupported mset behaviour");
            }

        })

        it("makes mget", function() {
            cache.mset([{key : 111, value : 111, ttl : 0}, {key : 112, value : 112, ttl : 1000 * 15}]);
            if (JSON.stringify(cache.mget([111, 675])) === JSON.stringify([111, null])) {
                cache.clear();
            } else {
                throw new Error("Unsupported mget behaviour");
            }

        })

        it("makes mdel", function() {
            cache.mset([{key : 111, value : 111, ttl : 0}, 
                    {key : 112, value : 112, ttl : 1000 * 15}, 
                    {key : 115, value : 115, ttl : 0}
                ]
            );
            cache.mdel([111,112])
            if (JSON.stringify(cache.mget([111, 112, 115])) === JSON.stringify([null, null, 115])) {
                cache.clear();
            } else {
                throw new Error("Unsupported mdel behaviour");
            }

        })
    })

    describe("Test for ttl",function() {
        let cache = new cacheConstructor(10);

        it("tests ttl",async function() {
            cache.setDefaultTtl(1000);
            cache.set(11, 12);
            await asyncTimeout(1500, () => {
                return !cache.has(11);
            })
        })

    })

    describe("Test key stringify", function() {

        it("Object keys are not equal by default", function() {
            let cache = new cacheConstructor(10);

            let awesomeKey = {
                "1" : 2
            }

            cache.set({"1" : 2},12);

            if (cache.get(awesomeKey)) {
                throw new Error("Strange behaviour");
            }
        })

        it("JSON strings are equal",function() {
            let cache = new cacheConstructor(10);
            let awesomeKey = {
                "1" : 2
            }
            cache.setStringifyKeys(true);
            cache.set({"1" : 2}, 2);
            if (!cache.get(awesomeKey)) {
                throw new Error("Strange behaviour");
            }
        })

    })
})

describe("heap tests", function() {
    let heap = new CacheHeap(4);

    let deleteElem = {key : 6, count : 6, index : -1};

    it("Add some elements to heap", function() {

        heap.insert(deleteElem);
        heap.insert({key : 5, count : 5, index : -1});
        heap.insert({key : 7, count : 7, index : -1});
        heap.insert({key : 4, count : 4, index : -1});
        console.log(heap.toStringKeys());
        if (heap.toStringKeys()[0] != '4') {
            throw new Error("Undefined behaviour");
          
        }
    })

    it("Tests overheap behaviour", function() {
        heap.insert({key : 9, count : 0, index : -1});
        console.log(heap.toStringKeys());
        if (heap.toStringKeys()[0] != '9') {
            throw new Error("Undefined behaviour");
          
        }
    })

    it("Tests 'delete'", function() {
        heap.delete(deleteElem);
        console.log(heap.toStringKeys());
        let s = heap.toStringKeys().trim();
        if (s[s.length - 1] != '7') {
             throw new Error("Undefined behaviour");
          
        }
    })

})

describe("MRU && LFU CACHE", function() {

    describe("constructs", function() {
        it("constructs with lru", function() {
            let cache = new cacheConstructor(10, {mainStorageType : "mru"})
        })
    
        it("constructs with mru", function() {
            let cache = new cacheConstructor(10, {mainStorageType : "mru"})
        })
        
        it("constructs with lfu", function() {
            let cache = new cacheConstructor(10, {mainStorageType : "lfu"})
        })
        
        it("constructs with unsupported type", function() {
            try {
                let cache = new cacheConstructor(10, {mainStorageType : "ffr"})
                throw new Error("Unsupported behaviour");
            } catch(e) {
                if (!(e instanceof CacheException)) {
                    throw e
                }
            }
        })
    })

    describe("tests LFU type of 'main' storage",function() {
        let lfu = new cacheConstructor(5, {mainStorageType : "lfu"});

        it("adds elem to cache", function() {
            let expected = JSON.stringify([true, true, true, false]);

            lfu.set(11,11);
            lfu.set(12,12);
            lfu.set(13,13);

            let actual = JSON.stringify([lfu.has(11), lfu.has(12), lfu.has(13), lfu.has(14)]);
            console.log(actual)
            if (expected != actual) {
                throw new Error("Unexpected behaviour");
            }
        })

        it ("gets elem from cache", function() {
            let expected = JSON.stringify([11, 12, 13, null]);
            let actual = JSON.stringify([lfu.get(11), lfu.get(12), lfu.get(13), lfu.get(14)]);
            console.log(actual);
            if (expected != actual) {
                throw new Error("Unexpected behaviour");
            }
        })
    })

})