"use strict";

function buildResult(operationResult) {
    return operationResult.length > 1 ? operationResult : operationResult[0];
}


function Defer() {
    this.promise = new Promise(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
    }.bind(this));
    Object.freeze(this);

}

function iterationResultHandler(resultHandler, done) {
    if (!done) {
        var defer = new Defer();
    }
    return function (iterationResult) {
        const value = iterationResult.value;
        if (value && value.then && value.catch) {
            const handler = resultHandler();
            value
                .then(handler.bind(null, null))
                .catch(handler);
        } else if (iterationResult.done && done) {
            done.apply(null, [null, value]);
        } else if (iterationResult.done) {
            defer.resolve(value);
        }
        return defer;
    };
}
function run(generatorTemplate, done) {
    const generator = generatorTemplate(resultHandler);
    const iterationHandler = iterationResultHandler(resultHandler, done);
    const defer = iterationHandler(generator.next());
    return defer && defer.promise;


    function resultHandler(isRaw, throwErrorInGenerator) {
        const bound = isRaw ? 0 : 1;
        return function (err) {
            if (err && !isRaw) {
                return void setImmediate(()=> {
                    if (throwErrorInGenerator) {
                        generator.throw(err);
                    }
                    if (done) {
                        return done(err);
                    }
                    defer.reject(err);
                });
            }
            const operationResult = Array.prototype.slice.call(arguments, bound);
            const toYield = err && isRaw ? operationResult : buildResult(operationResult);
            setImmediate(() => iterationHandler(generator.next(toYield), operationResult));
        };
    }


}
module.exports = run;
