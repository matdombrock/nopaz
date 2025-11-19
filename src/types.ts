export type SpecialMode = 'default' | 'number' | 'special' | 'none';

export type PazSite = {
  siteId: string;
  special: SpecialMode;
  length: number;
  revision: number;
  note: string;
  minIterations: number;
  algorithm: string;
  append: string;
}

