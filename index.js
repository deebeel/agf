"use strict";
const slice = [].slice;

function run(generatorTemplate, done) {
  const generator = generatorTemplate(resultHandler, finalizer);
  function finalizer(){
    return done || function(){
      throw new Error("Finalizer can't be called without done callback");
    };
  }
  function resultHandler(isRaw) {
    const bound = isRaw ? 0 : 1;
    return (err) => {
      if (err && !isRaw) {
        const toCall = (done && done.bind(null, err)) || generator.throw.bind(generator, err);
        return setImmediate(toCall);
      }
      const operationResult = slice.call(arguments, bound);
      const toReturn = operationResult.length > 1 ? operationResult : operationResult[0];
      setImmediate(generator.next.bind(generator, toReturn));
    };
  }
  generator.next();
}
module.exports = run;
