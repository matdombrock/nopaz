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

function customBase64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let b64 = btoa(String.fromCharCode(...bytes));
  // Replace '+' with '9', '/' with '8'
  b64 = b64.replace(/\+/g, '9').replace(/\//g, '8');
  // Replace padding '=' with 'A'
  b64 = b64.replace(/=+$/, (match) => 'A'.repeat(match.length));
  return b64;
}

function satisfiesRules(password: string): boolean {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const startsLower = /^[a-z]/.test(password);
  return hasUpper && hasLower && hasNumber && startsLower;
}

export class Paz {
  public static async hash(master: string, site: PazSite): Promise<string> {
    // Check for debug mode
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug') === '1';
    if (debug) {
      console.log('Paz debug mode enabled.');
      console.log(`Master: ${master}`);
      console.log(`Site: ${JSON.stringify(site)}`);
    }
    // Construct source string
    let source = `${master}:${site.siteId}`;
    if (typeof site.revision === 'number' && site.revision > 0) {
      source += `[${site.revision}]`;
    }
    const minIterations = site.minIterations ?? 1;
    const passwordLength = site.length ?? 12;
    // const addition = site.special ?? '';
    let hashSource = source;
    let iteration = 0;
    let password = '';

    while (true) {
      // (recursion point)
      // Hash source
      const encoder = new TextEncoder();
      const data = encoder.encode(hashSource);
      const hashBuffer = await crypto.subtle.digest('SHA-512', data);
      // Custom base64 encode
      const hash = customBase64Encode(hashBuffer);
      if (debug) console.log(`Iteration ${iteration}: hash=${hash}`);
      // Cut hash to length
      password = hash.slice(0, passwordLength);
      iteration += 1;

      // If not enough iterations, jump to recursion point with hash as source
      if (iteration < minIterations) {
        hashSource = hash;
        continue;
      }

      // Check rules
      if (!satisfiesRules(password)) {
        hashSource = hash;
        continue;
      }

      break;
    }
    if (debug) console.log(`Paz generated password in ${iteration} iterations.`);

    // Return password
    return `${password}`;
  }
}
