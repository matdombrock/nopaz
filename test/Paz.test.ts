import Paz from '../src/Paz';

import type { PazSite } from '../src/types';

const site: PazSite = {
  siteId: 'example.com',
  length: 16,
  minIterations: 10,
  append: '...',
  special: 'all',
  revision: 1,
  note: 'Test site',
  algorithm: 'sha512',
};

const hash = await Paz.hash('myMasterPassword', site);
console.log(`Generated hash: ${hash}`);
