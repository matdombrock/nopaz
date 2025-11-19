import RNG from './RNG';

// Generate a passphrase emoji based on a seed string
export default function passphraseEmoji(passphrase: string): string {
  // Unicode range for emojis: U+1F600 to U+1F64F
  const start = 0x1F600;
  const end = 0x1F64F;
  const rng = new RNG(passphrase);
  rng.warm(5);
  const codePoint = start + Math.floor(rng.get() * (end - start + 1));
  const emoji = String.fromCodePoint(codePoint);
  return emoji;
}
