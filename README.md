# agf
[![Build Status](https://travis-ci.org/deebeel/agf.png)](https://travis-ci.org/deebeel/agf)
#### A light lib for async flow based on generators, pritty simple and pretty useful


## Usage
##### A flow without a result callback
#
```javascript
agf(function* (resultHandler){
    const foo = yield fs.readFile("foo.txt", "ascii", resultHandler());
    const res = foo.toUpperCase();
    return fs.writeFile(res, resultHandler());
});
```
##### A flow without a result callback
#
```javascript
agf(function* (resultHandler){
    const foo = yield fs.readFile("there is not such a file.txt", "ascii", resultHandler());
    //won't be called because of throwing error
    const res = foo.toUpperCase();
    return fs.writeFile(res, resultHandler());
});
```

##### A flow with a result callback and an eager error propagation
#
```javascript
agf(function* (resultHandler){
    const foo = yield fs.readFile("there is not such a file.txt", "ascii", resultHandler());
    //won't be called
    const res = foo.toUpperCase();
    return res;
}, (err, res)=>{
   //there is the error 
});
```


##### A flow with a result callback and a custom error handling
#
```javascript
agf(function* (resultHandler){
    const foo = yield fs.readFile("there is not such a file.txt", "ascii", resultHandler(true));
    //foo = array, it has only one element and it is an error
    return foo;
}, (err, res)=>{
   //there is not the error, but result is the array with the error
});
```


##### A flow with a result callback and multi result
#

```javasctipt
agf(function* (resultHandler){
    const foo = yield request.get("http://www.google.com", resultHandler());
    //foo is [null, resp, body]
    return fs.writeFile("foo.txt", body, resultHandler());
}, (err, res)=>{
   //there are not both the err and res
});
```

