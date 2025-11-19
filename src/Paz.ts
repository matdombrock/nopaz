/*
https://github.com/eblade/paz/tree/master?tab=readme-ov-file#the-algorithm-in-detail
 
    The source is constructed as <master>:<site>[revision] where [revision] is an optional integer. The number 0 is never printed and negative numbers are not supported.
    (recursion point)
    Hash source with the selected hashing function
    Base64-encode the result, except the last two characters in the "alphabet" should be changed to 98 and the padding should be A. This is called hash.
    Cut hash to length and call it password.
    If the iteration count is less than min-iterations, jump to (recursion point) with hash as source.
    Check that the following rules are satisfied by password:
        Has at least one upper case letter
        Has at least one lower case letter
        Has at least one number
        Starts with a lower case letter
    If the rules are not satisfied, jump back to (recursion point) with hash as source.
    Return <password>[addition]
*/

import type { PazSite } from './types';
import dbg from './dbg';

type PazChecks = {
  hasUpper: boolean,
  hasLower: boolean,
  hasNumber: boolean,
  noNumber: boolean,
  startLower: boolean,
}

type PazSpecialRules = {
  [key: string]: PazChecks,
}

export default class Paz {

  private static specialRules: PazSpecialRules = {
    all: {
      hasUpper: true,
      hasLower: true,
      hasNumber: true,
      noNumber: false,
      startLower: true,
    },
    legacy: {
      hasUpper: true,
      hasLower: true,
      hasNumber: true,
      noNumber: false,
      startLower: true,
    },
    none: {
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      noNumber: false,
      startLower: false,
    }
  };

  private static customBase64Encode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let b64 = btoa(String.fromCharCode(...bytes));
    // Replace '+' with '9', '/' with '8'
    b64 = b64.replace(/\+/g, '9').replace(/\//g, '8');
    // Replace padding '=' with 'A'
    b64 = b64.replace(/=+$/, (match) => 'A'.repeat(match.length));
    return b64;
  }

  private static satisfiesRules(password: string, rules: PazChecks): boolean {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const startLower = /^[a-z]/.test(password);
    let pass = true;
    if (rules.hasUpper && !hasUpper) {
      pass = false;
      dbg('! Failed uppercase check.');
    }
    if (rules.hasLower && !hasLower) {
      pass = false;
      dbg('! Failed lowercase check.');
    }
    if (rules.hasNumber && !hasNumber) {
      pass = false;
      dbg('! Failed number check.');
    }
    if (rules.noNumber && hasNumber) {
      pass = false;
      dbg('! Failed no-number check.');
    }
    if (rules.startLower && !startLower) {
      pass = false;
      dbg('! Failed start lowercase check.');
    }
    return pass;
  }

  public static async hash(master: string, site: PazSite): Promise<string> {
    dbg('Paz debug mode enabled.');
    dbg(`Master: ${master}`);
    dbg(`Site: ${JSON.stringify(site)} `);
    // Construct source string
    let source = `${master}:${site.siteId} `;
    if (typeof site.revision === 'number' && site.revision > 0) {
      source += `${site.revision} `;
    }
    dbg(`Initial source: ${source} `);
    const minIterations = site.minIterations ?? 1;
    const passwordLength = site.length ?? 12;
    const addition = site.append ?? '';
    let hashSource = source;
    let iteration = 0;
    let password = '';

    // Key algos in lower case for og paz compatibility
    const algorithms: { [key: string]: string } = {
      'sha512': 'SHA-512',
      'sha256': 'SHA-256',
      'SHA-512': 'SHA-512',
      'SHA-256': 'SHA-256',
    };
    if (algorithms[site.algorithm] === undefined) {
      dbg(`Unknown algorithm "${site.algorithm}", defaulting to SHA - 512.`);
    }
    const algorithm = algorithms[site.algorithm] || 'SHA-512';

    const rules = Paz.specialRules[site.special ?? 'all'];
    if (!rules) {
      throw new Error(`Unknown special rules "${site.special}".`);
    }
    dbg('Rules: ' + JSON.stringify(rules) + ' ');

    while (true) {
      // (recursion point)
      // Hash source
      const encoder = new TextEncoder();
      const data = encoder.encode(hashSource);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      // Custom base64 encode
      const hash = Paz.customBase64Encode(hashBuffer);
      // Cut hash to length
      password = hash.slice(0, passwordLength);
      dbg(`Iteration ${iteration}: password = ${password} `);
      iteration += 1;

      // If not enough iterations, jump to recursion point with hash as source
      if (iteration < minIterations) {
        hashSource = hash;
        continue;
      }

      if (!Paz.satisfiesRules(password, rules)) {
        hashSource = hash;
        continue;
      }

      break;
    }
    dbg(`Paz generated password in ${iteration} iterations.`);

    // Return password
    return `${password}${addition} `;
  }
}
