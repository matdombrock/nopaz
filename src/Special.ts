import RNG from './RNG';

import type { SpecialMode } from './types';

type SpecialModeList = { [key in SpecialMode]: (password: string) => string }

export default class Special {
  // Replace character at position with char
  private static replace(password: string, char: string, position: number): string {
    return password.substring(0, position) + char + password.substring(position + 1);
  }
  // Return a set of unique random positions within the password
  private static rPositions(password: string, count: number): number[] {
    const rng = new RNG(password);
    const positions = new Set<number>();
    while (positions.size < count) {
      const pos = Math.floor(rng.get() * password.length);
      positions.add(pos);
    }
    return Array.from(positions);
  }
  // Return a random uppercase character
  private static rUpperChar(password: string): string {
    const rng = new RNG(password);
    const char = 'A'.charCodeAt(0) + Math.floor(rng.get() * 26);
    return String.fromCharCode(char);
  }
  // Return a random numeric character
  private static rNumberChar(password: string): string {
    const rng = new RNG(password);
    const char = '0'.charCodeAt(0) + Math.floor(rng.get() * 10);
    return String.fromCharCode(char);
  }
  // Return a random special character
  private static rSpecialChar(password: string): string {
    const rng = new RNG(password);
    const char = 33 + Math.floor(rng.get() * 15); // ASCII 33 to 47
    return String.fromCharCode(char);
  }
  // None mode
  private static mNone(password: string): string {
    return password;
  }
  // Default mode
  // Ensures at least one uppercase, one number, and one special character
  private static mDefault(password: string): string {
    const upperCharCode = Special.rUpperChar(password);
    const numberCharCode = Special.rNumberChar(password);
    const specialCharCode = Special.rSpecialChar(password);
    // Replace characters at the selected positions
    const rpos = Special.rPositions(password, 3);
    password = Special.replace(password, upperCharCode, rpos[0]!);
    password = Special.replace(password, numberCharCode, rpos[1]!);
    password = Special.replace(password, specialCharCode, rpos[2]!);
    return password;
  }
  // Number mode
  // Ensures at least one number
  private static mNumber(password: string): string {
    const numberCharCode = Special.rNumberChar(password);
    // Replace characters at the selected positions
    const rpos = Special.rPositions(password, 1);
    password = Special.replace(password, numberCharCode, rpos[0]!);
    return password;
  }
  // Special mode
  private static mSpecial(password: string): string {
    const specialCharCode = Special.rSpecialChar(password);
    // Replace characters at the selected positions
    const rpos = Special.rPositions(password, 1);
    password = Special.replace(password, specialCharCode, rpos[0]!);
    return password;
  }
  // A list of available modes
  private static modes: SpecialModeList = {
    default: Special.mDefault,
    number: Special.mNumber,
    special: Special.mSpecial,
    none: Special.mNone,
  };
  // Generate a special password based on the mode
  public static generate(password: string, mode: SpecialMode): string {
    const func = Special.modes[mode] || Special.mNone;
    return func(password);
  }
}
