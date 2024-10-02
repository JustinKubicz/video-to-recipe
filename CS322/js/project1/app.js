

exports.addemup = function addemup(){
    let args = Array.from(arguments);
    return args.reduce( (a, b) => (a + b), 0);
}

