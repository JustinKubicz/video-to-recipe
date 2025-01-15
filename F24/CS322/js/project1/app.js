const fs = require('fs');

exports.addemup = function addemup(){
    let args = Array.from(arguments);
    return args.reduce( (a, b) => (a + b), 0);
}

exports.capturedScope = function capturedScope(n){
    return (m)=>m*n;
}


writeErrorHandler(err){
    if(!err) console.log("Error on file write.");
}

function readCompleteHandler(err, data){
    if(err){
        console.log(err);
    } else {
        fs.writeFile('./copy', data, writeErrorHandler)
    }
}
exports.readWholeFile = function(filename){fs.readFile(filename, 'utf-8', readCompleteHandler)};