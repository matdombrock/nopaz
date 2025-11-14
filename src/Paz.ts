import type { Site } from './types';

export class Paz {
  public static async hash(master: string, site: Site): Promise<string> {
    // Combine all relevant fields for deterministic hashing
    const input = `${master}:${site.siteId}:${site.special}:${site.length}:${site.revision}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Truncate to desired length
    // Return only the first 'length' characters
    // Assuming length is in characters, not bytes
    const truncatedHash = hashHex.slice(0, site.length);
    // Repace the end of the hash with special characters if provided
    if (site.special) {
      const specialLength = site.special.length;
      return truncatedHash.slice(0, -specialLength) + site.special;
    }
    return truncatedHash;
  }
}
