import RNG from './RNG';

export default function passphraseEmoji(seed: string): string {
  // Unicode range for emojis: U+1F600 to U+1F64F
  const start = 0x1F600;
  const end = 0x1F64F;
  const rng = new RNG(seed);
  const codePoint = start + Math.floor(rng.get() * (end - start + 1));
  const emoji = String.fromCodePoint(codePoint);
  return emoji;
}
