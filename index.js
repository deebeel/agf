"use strict";

function buildResult(operationResult) {
    return operationResult.length > 1 ? operationResult : operationResult[0];
}

function iterationResultHandler(resultHandler, done) {
    return function (iterationResult) {
        const value = iterationResult.value;
        if (value instanceof Promise) {
            const handler = resultHandler();
            value
                .then(handler.bind(null, null))
                .catch(handler);
        } else {
            if (iterationResult.done && done) {
                done.apply(null, [null, value]);
            }
        }
    };
}
function run(generatorTemplate, done) {
    const generator = generatorTemplate(resultHandler);
    const iterationHandler = iterationResultHandler(resultHandler, done);

    function resultHandler(isRaw) {
        const bound = isRaw ? 0 : 1;
        return function (err) {
            if (err && !isRaw) {
                return setImmediate(()=>(done && done(err)) || generator.throw(err));
            }
            const operationResult = Array.prototype.slice.call(arguments, bound);
            const toYield = err && isRaw ? operationResult : buildResult(operationResult);
            setImmediate(() => iterationHandler(generator.next(toYield)));
        };
    }

   return iterationHandler(generator.next());

}
module.exports = run;
