process.env.NODE_ENV = 'test';

const cacheConstructor = require('../index');
const CacheException = require('../js/cache2Q').CacheException;

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
