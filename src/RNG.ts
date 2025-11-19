export default class RNG {
  private seed: number;

  constructor(seed: string | number) {
    this.seed = RNG.hash(seed.toString()) >>> 0; // Ensure unsigned
  }
  // Simple hash function to convert a string into a number
  // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
  public static hash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash >>> 0; // Ensure unsigned 32-bit integer
  }
  // Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive)
  // using a simple linear congruential generator (LCG) algorithm
  // https://en.wikipedia.org/wiki/Linear_congruential_generator
  public get(): number {
    // LCG constants
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    let seed = this.seed;
    // Generate the next random number
    seed = (a * seed + c) % m;
    // Re-seed the generator
    this.seed = (a * seed + c) % m;
    // Return a number between 0 and 1
    return seed / m;
  }
}

