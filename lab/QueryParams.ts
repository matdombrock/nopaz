import type { PazSite } from './types';

import crypto from 'crypto';

export default class QueryParams {
  // Encrypt a site using master passphrase
  public static async encrypt(passphrase: string, site: PazSite): Promise<string> {
    const siteStr = JSON.stringify(site);
    const key = crypto.createHash('sha256').update(passphrase).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(siteStr, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const result = iv.toString('base64') + ':' + encrypted;
    return result;
  }

  // Decrypt a site using master passphrase
  // Returns a PazSite object
  public static async decrypt(passphrase: string, encrypted: string): Promise<PazSite> {
    const [ivB64, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivB64 ?? '', 'base64');
    const key = crypto.createHash('sha256').update(passphrase).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData!, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    const site: PazSite = JSON.parse(decrypted);
    return site;
  }
}

const site: PazSite = {
  siteId: 'example.com',
  special: 'default',
  length: 16,
  revision: 1,
  note: 'My example site',
  minIterations: 1000,
  algorithm: 'SHA-512',
  append: '!@#',
};

// const encoded = QueryParams.encode(site);
// const decoded = QueryParams.decode(encoded);
// console.log('Original site:', site);
// console.log('Encoded string:', encoded);
// console.log('Decoded site:', decoded);

const encrypted = await QueryParams.encrypt('myMasterPassphrase', site);
const decrypted = await QueryParams.decrypt('myMasterPassphrase', encrypted);
console.log('Encrypted string:', encrypted);
console.log('Decrypted site:', decrypted);
