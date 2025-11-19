export type PazSpecialMode = 'all' | 'legacy' | 'none';

export type PazSite = {
  siteId: string;
  special: PazSpecialMode;
  length: number;
  revision: number;
  note: string;
  minIterations: number;
  algorithm: string;
  append: string;
}

