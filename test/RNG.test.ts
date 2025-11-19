import RNG from "../src/RNG";

console.log(RNG.hash("asd1"));
console.log(RNG.hash("asd2"));
console.log(RNG.hash("asd3"));
console.log(RNG.hash("asd4"));
console.log(RNG.hash("asd1-1"));

console.log();

console.log(new RNG("asd1").get());
console.log(new RNG("asd2").get());
console.log(new RNG("asd3").get());
console.log(new RNG("asd4").get());

console.log();

console.log(new RNG("asd1").warmup().get());
console.log(new RNG("asd2").warmup().get());
console.log(new RNG("asd3").warmup().get());
console.log(new RNG("asd4").warmup().get());
