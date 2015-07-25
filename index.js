"use strict";
function argumentsToResult(args, isRaw){
  const sliceStartIndex = isRaw ? 0 : 1;
  const res = [].slice.call(args, sliceStartIndex);
  return res.length > 1 ? res : res[0];
}

function prepareFunctionToCall(callback, generator){
  return callback ? callback : generator.throw.bind(generator);
}

function run(generatorTemplate, isRaw, callback) {
  if (typeof isRaw === "function") {
    callback = isRaw;
    isRaw = false;
  }
  let generator = null;
  const toCall = prepareFunctionToCall(generator, callback);
  function resultHandler(err) {
    if (err) {
      return setImmediate(()=>toCall(err));
    }
    setImmediate(()=>generator.next(argumentsToResult(arguments, isRaw)));
  }
  generator = generatorTemplate(resultHandler);
  generator.next();
}
module.exports = run;
