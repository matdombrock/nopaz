// Password generation configuration modes
export type PazSpecialMode =
  'all'      // Include all character types 
  | 'legacy' // Legacy mode without symbols
  | 'none';  // No special rules

// Optional values should be provided as an empty string
export type PazSite = {
  siteId: string; // Site name or identifier
  special: PazSpecialMode; // Special mode for password rules
  length: number; // Desired password length
  revision: number; // Revision number
  note: string; // Optional note
  minIterations: number; // Minimum iterations for hashing
  algorithm: string; // Hashing algorithm
  append: string; // Optional string to append to the password
}

