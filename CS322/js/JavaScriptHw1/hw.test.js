
const hw = require("./hw.js");

// Problem 1:
//   Create a function named incrementer that takes one parameter delta.
//   It should return a function of one argument that returns the sum
//     of its argument and delta.

const plusSeven = hw.incrementer(7);
const plusTwo = hw.incrementer(2);

test("test add 7 to 3", () => {expect(plusSeven(3)).toBe(10)});
test("test add 7 to 5", () => {expect(plusSeven(5)).toBe(12)});
test("test add 2 to 3", () => {expect(plusTwo(3)).toBe(5)});
test("test add 2 to 5", () => {expect(plusTwo(5)).toBe(7)});

// Problem 2:
//    Create a function named rms that takes a varying number of arguments.
//    It should return the root mean square of its arguments.
//    to calculate RMS, Square each number, average the squares, and return 
//    the square root of the average.
//  For full credit, you must use map and reduce in the calculation.
//  Note: the Math class has a static method sqrt(n) that calculates square root.

test("test rms",
    () => {expect(hw.rms(2.3, 3.1, 4.4)).toBeCloseTo(3.379349049)}); 

// Problem 3:
//    Consider a Rectangle object with a width, a height, and a
//    method called area.
//    Create a version 5.1 constructor function for this object.
//    If a width or height are not passed in, use a default value of 1 for
//    width and height.
//    The constructor function should return the area of the rectangle.

test("test default as a function",
  () => {expect(hw.Rectangle()).toBe(1)});
test("test default width as a function",
  () => {expect(hw.Rectangle(3)).toBe(3)}); 
test("test as a function",
  () => {expect(hw.Rectangle(3,2)).toBe(6)}); 
let myRect = new hw.Rectangle(3,2);
test("test as a constructor",
  () => {expect(myRect.area()).toBe(6)}); 
test("test as a constructor",
  () => {expect(myRect.width).toBe(3)}); 
test("test as a constructor",
  () => {expect(myRect.height).toBe(2)}); 

// Problem 4:
//   Create a function called makeWarning that takes a warning message from gcc
//   and creates an object with fields filename, lineNumber, warningMessage.
//   If the message is not present, the function should return null. 
//   You must use exactly one regular expression match operation to identify
//   the values.

const gccOutput = "src/plat/unxUtil.c:423: warning: large integer implicitly truncated to unsigned type";

let warningString = "src/plat/unxUtil.c:423: warning: large integer implicitly truncated to unsigned type";
let notWarningString = "src/plat/unxUtil.c: In function ‘setIOsem’:";


test(
  'test no match',
  () => {expect(hw.makeWarning(notWarningString)).toBeNull()});

let myWarning = hw.makeWarning(warningString);

test(
 'test filename',
  () => {expect(myWarning.filename).toBe('src/plat/unxUtil.c')});
test(
  'test lineNumber',
  () => {expect(myWarning.lineNumber).toBe('423')});
test(
  'test warningMessage',
  () => {expect(myWarning.warningMessage).toBe('large integer implicitly truncated to unsigned type')});