"use strict";
const slice = [].slice;

function run(generatorTemplate, done) {
  const generator = generatorTemplate(resultHandler);
  let isDone = false;
  function resultHandler(isRaw) {
    const bound = isRaw ? 0 : 1;
    return (err) => {
      if (err && !isRaw) {
        const toCall = (done && done.bind(null, err)) || generator.throw.bind(generator, err);
        return setImmediate(toCall);
      }
      const operationResult = slice.call(arguments, bound);
      let toYield = null;
      if(err && isRaw){
        toYield = operationResult;
      } else {
        toYield = operationResult.length > 1 ? operationResult : operationResult[0];
      }
      setImmediate(() => {
        if (isDone) {
          operationResult.unshift(null);
          return done.apply(null, operationResult);
        }
        const iterationResut = generator.next(toYield);
        isDone = iterationResut.done;
        if (isDone && done && typeof iterationResut.value !== "undefined") {
          done(null, iterationResut.value);
        }
      });
    };
  }
  generator.next();
}
module.exports = run;
