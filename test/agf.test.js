"use strict";
const agf = require("../index.js");
const domain = require("domain");
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
    const d = domain.create();
    d.on("error", (e) => {
      e.message.should.be.eql("error");
      done();
    });
    d.run(() => {
      agf(function* (resultHandler){
        const res = yield asyncFunction("res", false)(resultHandler());
        res.should.be.eql("res");
        return asyncFunction(new Error("error"), true)(resultHandler());
      });
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

  it("should successfully finalize the generator and return result to the callback", (done)=>{
    agf(function* (resultHandler){
      const res = yield asyncFunction("resstart", false)(resultHandler());
      res.should.be.String();
      res.should.be.eql("resstart");
      return asyncFunction("res", false)(resultHandler());
    }, (err, res) => {
      (!err).should.be.true();
      res.should.be.eql("res");
      done();
    });
  });


  it("should successfully finalize the generator and return value passed to the return satement", (done)=>{
    agf(function* (resultHandler){
      const res = yield asyncFunction("resstart", false)(resultHandler());
      res.should.be.String();
      res.should.be.eql("resstart");
      return 10;
    }, (err, res) => {
      (!err).should.be.true();
      res.should.be.eql(10);
      done();
    });
  })
});
