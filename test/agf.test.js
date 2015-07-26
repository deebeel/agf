"use strict";
const agf = require("../index.js");


describe("#agf", ()=>{
  function asyncFunction(ret, fail){
    return (cb) => {
      if(fail){
        return cb(ret);
      }

      if(Array.isArray(ret)){
        ret.unshift(null);
        return cb.apply(null, ret);
      }
      cb(null, ret);
    };
  }

  it("should throw an error because of absence of the done callback", (done)=>{
    agf(function* (resultHandler, finalizer){
      const res = yield asyncFunction("res", false)(resultHandler());
      res.should.be.eql("res");
      try{
        asyncFunction(new Error("error"), true)(finalizer());
      }catch (e){
        e.should.be.an.Error();
        done();
      }
    });
  });

  it("should throw an generator error because of absence of the done callback", (done)=>{
    agf(function* (resultHandler, finalizer){
      try{
       yield asyncFunction(new Error("error"), true)(finalizer());
      }catch (e){
        e.should.be.an.Error();
        done();
      }
    });
  });

  it("should return an error", (done)=>{
    agf(function* (resultHandler){
      const e = yield asyncFunction(new Error("error"), true)(resultHandler(true));
      e.should.be.an.Error();
      e.message.should.be.eql("error");
      done();
    });
  });

  it("should return an array with results", (done)=>{
    agf(function* (resultHandler){
      const res = yield asyncFunction([1, 2], false)(resultHandler(true));
      res.should.be.an.Array();
      res.should.be.eql([null, 1, 2]);
      done();
    });
  });

  it("should invoke an async function gracefully", (done)=>{
    agf(function* (resultHandler){
      const res = yield asyncFunction("res", false)(resultHandler());
      res.should.be.String();
      res.should.be.eql("res");
      done();
    });
  });

  it("should successfully finalize the generator", (done)=>{
    agf(function* (resultHandler, finalizer){
      const res = yield asyncFunction("resstart", false)(resultHandler());
      res.should.be.String();
      res.should.be.eql("resstart");
      return asyncFunction("res", false)(finalizer());
    }, (err, res) => {
      (!err).should.be.true();
      res.should.be.String();
      res.should.be.eql("res");
      done();
    });
  });
});
