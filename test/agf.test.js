"use strict";
const agf = require("../index.js");
describe("#agf", ()=> {
    function asyncFunction(ret, fail) {
        return (cb) => {
            if (fail) {
                return cb(ret);
            }

            if (Array.isArray(ret)) {
                ret.unshift(null);
                return cb.apply(null, ret);
            }
            cb(null, ret);
        };
    }
    it("should catch an error after a first next call with promise", (done)=> {
        agf(function* (resultHandler) {
            return yield asyncFunction(new Error("error"), true)(resultHandler());
        }).catch((e) => {
            e.message.should.be.eql("error");
            done();
        });
    });
    it("should catch an error after a first next call with callback", (done)=> {
        agf(function* (resultHandler) {
            return yield asyncFunction(new Error("error"), true)(resultHandler());
        },(e) => {
            e.message.should.be.eql("error");
            done();
        });
    })
    it("should catch an error because of absence of the done callback", (done)=> {
         agf(function* (resultHandler) {
            const res = yield asyncFunction("res", false)(resultHandler());
            res.should.be.eql("res");
            return yield asyncFunction(new Error("error"), true)(resultHandler());
        }).catch((e) => {
            e.message.should.be.eql("error");
            done();
        });
    });


    it("should throw an error because of absence of the done callback", (done)=> {
        agf(function* (resultHandler) {
            const res = yield asyncFunction("res", false)(resultHandler());
            res.should.be.eql("res");
            try{
                return yield asyncFunction(new Error("error"), true)(resultHandler(false, true));
            }catch(e){
                e.message.should.be.eql("error");
                done();

            }
        }).catch(() => {
            throw new Error("unreachable place");
        });
    });


    it("should return an error", (done)=> {
        agf(function* (resultHandler) {
            const e = yield asyncFunction(new Error("error"), true)(resultHandler({a: 100}));
            e[0].should.be.an.Error();
            e[0].message.should.be.eql("error");
            done();
        });
    });

    it("should return an array with results", (done)=> {
        agf(function* (resultHandler) {
            const res = yield asyncFunction([1, 2], false)(resultHandler(true));
            res.should.be.an.Array();
            res.should.be.eql([null, 1, 2]);
            done();
        });
    });

    it("should invoke an async function gracefully", (done)=> {
        agf(function* (resultHandler) {
            const res = yield asyncFunction("res", false)(resultHandler());
            res.should.be.String();
            res.should.be.eql("res");
            done();
        });
    });

    it("should successfully finalize the generator and return result to the callback", (done)=> {
        agf(function* (resultHandler) {
            const res = yield asyncFunction("resstart", false)(resultHandler());
            res.should.be.String();
            res.should.be.eql("resstart");
            return yield asyncFunction("res", false)(resultHandler());
        }, (err, res) => {
            (!err).should.be.true();
            res.should.be.eql("res");
            done();
        });
    });

    it("should successfully finalize the generator and return result to the callback", (done)=> {
        agf(function* (resultHandler) {
            return yield asyncFunction("resstart", false)(resultHandler());
        }, (err, res) => {
            (!err).should.be.true();
            res.should.be.eql("resstart");
            done();
        });
    });


    it("should successfully finalize the generator and return just the result to the callback", (done)=> {
        agf(function* () {
            return 20;
        }, (err, res) => {
            (!err).should.be.true();
            res.should.be.eql(20);
            done();
        });
    });


    it("should successfully resolve the promise, finalize the generator, and return just the result to the callback", (done)=> {
        agf(function* () {
            return yield Promise.resolve(20);
        }, (err, res) => {
            (!err).should.be.true();
            res.should.be.eql(20);
            done();
        });
    });


    it("should mix the promises with callbacked api and return just the result to the callback", (done)=> {
        agf(function* (resultHandler) {
            const p1 = Promise.resolve(2);
            const p2 = Promise.resolve(3);
            const p3 = yield Promise.resolve(20);
            const c = yield asyncFunction(40, false)(resultHandler());
            const pp = yield Promise.all([p1, p2]);
            return pp.concat([p3, c]);
        }, (err, res) => {
            (!err).should.be.true();
            res.should.be.eql([2, 3, 20, 40]);
            done();
        });
    });

    it("should return a promise and reject it", (done)=> {
        agf(function* () {
            return yield Promise.reject(new Error("error"));
        }).catch((err) => {
            err.should.be.an.Error();
            err.message.should.be.eql("error");
            done();
        });
    });

    it("should reject the promise, finalize the generator, and return just the error to the callback", (done)=> {
        agf(function* () {
            return yield Promise.reject(new Error("error"));
        }, (err) => {
            err.should.be.an.Error();
            err.message.should.be.eql("error");
            done();
        });
    });

    it("should successfully interrupt the generator and return result to the callback", (done)=> {
        agf(function* (resultHandler) {
            const res = yield asyncFunction(10, false)(resultHandler());
            if (res === 10) {
                return yield asyncFunction("res", false)(resultHandler());
            }
            return yield asyncFunction("unreached", false)(resultHandler());
        }, (err, res) => {
            (!err).should.be.true();
            res.should.be.eql("res");
            done();
        });
    });


    it("should successfully interrupt the generator and return a raw result to the callback", (done)=> {
        agf(function* (resultHandler) {
            const res = yield asyncFunction(10, false)(resultHandler());
            if (res === 10) {
                return yield asyncFunction(new Error("error"), true)(resultHandler());
            }
            return yield asyncFunction("unreached", false)(resultHandler());
        }, (err) => {
            err.should.be.an.Error();
            done();
        });
    });

    it("should successfully finalize the generator and return value passed to the return satement", (done)=> {
        agf(function* (resultHandler) {
            const res = yield asyncFunction("resstart", false)(resultHandler());
            res.should.be.String();
            res.should.be.eql("resstart");
            return 10;
        }, (err, res) => {
            (!err).should.be.true();
            res.should.be.eql(10);
            done();
        });
    });
});
