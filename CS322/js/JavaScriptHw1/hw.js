
exports.incrementer = function (delta) {
    return function (toIncrement) {
        return delta + toIncrement;
    }
}
exports.rms = function () {
    //Array.from(arguments) converts the "array-like" list of args into an actual array that understands map and reduce
    let args = Array.from(arguments);
    let squared = args.map(n =>
        n * n
    )
    let sum = squared.reduce((running, current) => {
        return running + current;
    }, 0);
    sum /= args.length;
    let ans = Math.sqrt(sum);
    return ans;
}

exports.Rectangle = function Rectangle(width, height) {

    this.width = width ?? 1;
    this.height = height ?? 1;
    this.area = function area() { return this.width * this.height };
    return this.area();
}

exports.makeWarning = function (message) {
    //"src/plat/unxUtil.c:423: warning: large integer implicitly truncated to unsigned type"
    if (message) {
        let pattern = /((.*):(\d+)(: )(.*)(: )(.*))/g;
        let match = pattern.exec(message);
        if (!match) {

            return null
        }
        else if (match[5] == "warning") {
            this.filename = match[2];
            this.lineNumber = match[3];
            this.warningMessage = match[7];
            return this;
        } else {
            return null;
        }
    }
}
