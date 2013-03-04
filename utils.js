var Promise = function() {
    this.queue = [];
};

Promise.prototype.done = function() {
    var next = this.queue.shift();
    if (next && next.callback) {
        var p = next.callback.apply(null, arguments);
        if (p instanceof Promise)
            p.queue = this.queue;
    }
}

Promise.prototype.err = function() {
    var next = this.queue.shift();
    if (next && next.errback) {
        var p = next.errback.apply(null, arguments);
        if (p instanceof Promise)
            p.queue = this.queue;
    }
}

Promise.prototype.then = function(callback, errback) {
    this.queue.push({callback: callback, errback: errback});
    return this;
}


function partial() {
    var that = this;
    var partialArgs = [].slice.apply(arguments);
    var f = partialArgs.shift();
    return function() {
        args = [].slice.apply(arguments);
        return f.apply(that, partialArgs.concat(args));
    }
}

module.exports.partial = partial;
module.exports.Promise = Promise;

