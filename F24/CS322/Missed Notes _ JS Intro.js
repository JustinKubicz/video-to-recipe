console.log("Hello, world!\n");

console.log([1,2,3].map(function(x){return x*x}))


redGuy = {name:"Santa"};

redGuy.speak = function(){console.log("\nSanta says: ho ho ho")};

redGuy.speak();

bob = {
    name:"Santa",
    speak: function(){console.log("\Bob says: Wassup")}
}
bob.speak();

function Student(name, major){
    this.name = name;
    this.major = major;
    return major;
}

let clown = new Student("Bozo", "Clowning");
let simp = { name: "sideShowBob", major: "Clowning"};