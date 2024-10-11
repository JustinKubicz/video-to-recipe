//zero hour is 13:57:00 on 25-dec-2024
// write function getInfo(aString) returns an object w/ time and date properties

function getInfo(aString){
    let pattern = /.*((\d\d):(\d\d):(\d\d)).*((\d?\d)-([A-Z][a-z]{2})-(\d{4}))/g; //read some more about regex, figure out this delimiter
    let answer = { };
    let match = pattern.exec(aString);
    if(!match) return null;
    answer.time = match[1];
    answer.date = match[5]; 
    return answer;
}

console.log(getInfo("zero hours is 13:57:00 on 25-Dec-2024."));