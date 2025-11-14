import type { Site } from './types';

import { Paz } from './Paz';
import getPoemLine from './astro';

type PazElements = {
  master: HTMLInputElement;
  site: HTMLInputElement;
  special: HTMLInputElement;
  length: HTMLInputElement;
  revision: HTMLInputElement;
  hash: HTMLInputElement;
  replication: HTMLInputElement;
  btnExtras: HTMLButtonElement;
  uiExtrasContainer: HTMLDivElement;
  btnImport: HTMLButtonElement;
  btnExport: HTMLButtonElement;
  tipClip: HTMLDivElement;
}


class PazUI {
  private elements: PazElements;
  constructor() {
    this.elements = {
      master: document.getElementById('in-master') as HTMLInputElement,
      site: document.getElementById('in-site') as HTMLInputElement,
      special: document.getElementById('in-special') as HTMLInputElement,
      length: document.getElementById('in-length') as HTMLInputElement,
      revision: document.getElementById('in-revision') as HTMLInputElement,
      hash: document.getElementById('out-hash') as HTMLInputElement,
      replication: document.getElementById('io-replication') as HTMLInputElement,
      btnExtras: document.getElementById('btn-extras') as HTMLButtonElement,
      uiExtrasContainer: document.getElementById('ui-extras-container') as HTMLDivElement,
      btnImport: document.getElementById('btn-import') as HTMLButtonElement,
      btnExport: document.getElementById('btn-export') as HTMLButtonElement,
      tipClip: document.getElementById('tip-clip') as HTMLDivElement,
    };
    this.elements.master.addEventListener('input', () => this.computeHash());
    this.elements.site.addEventListener('input', () => this.computeHash());
    this.elements.special.addEventListener('input', () => this.computeHash());
    this.elements.length.addEventListener('input', () => this.computeHash());
    this.elements.revision.addEventListener('input', () => this.computeHash());
    this.elements.replication.addEventListener('input', () => this.import());

    // Set default values
    this.elements.master.value = '';
    this.elements.master.placeholder = getPoemLine();
    this.elements.site.value = '';
    this.elements.length.value = '16';
    this.elements.revision.value = '1';
    this.elements.special.value = 'all';
    this.elements.hash.value = '';

    this.elements.btnExtras.addEventListener('click', () => {
      if (this.elements.uiExtrasContainer.style.display === 'none' || this.elements.uiExtrasContainer.style.display === '') {
        this.elements.uiExtrasContainer.style.display = 'block';
      } else {
        this.elements.uiExtrasContainer.style.display = 'none';
      }
    });

    this.elements.btnExport.addEventListener('click', () => {
      if (this.elements.replication.style.display === 'none' || this.elements.replication.style.display === '') {
        this.elements.replication.style.display = 'block';
      } else {
        this.elements.replication.style.display = 'none';
      }
    });

    this.elements.hash.addEventListener('click', () => {
      if (!this.elements.hash.value || this.elements.hash.value === '') {
        return
      };
      this.elements.hash.select();
      document.execCommand('copy');
      this.elements.tipClip.innerText = 'Password copied to clipboard!';
      this.elements.tipClip.style.display = 'block';
    });
  }
  public import(): void {
    const replicationValue = this.elements.replication.value;
    const replicationJSON = JSON.parse(replicationValue);
    this.elements.site.value = replicationJSON.domain;
    this.elements.special.value = replicationJSON.special;
    this.elements.length.value = replicationJSON.length.toString();
    this.elements.revision.value = replicationJSON.revision.toString();
    this.elements.tipClip.innerText = 'Imported replication data.';
    this.elements.tipClip.style.display = 'block';
    this.computeHash();
  }
  public async computeHash(): Promise<void> {
    console.log('Computing hash...');
    const site: Site = {
      siteId: this.elements.site.value,
      special: this.elements.special.value,
      length: parseInt(this.elements.length.value, 10),
      revision: parseInt(this.elements.revision.value, 10),
    };
    const master = this.elements.master.value;
    let hash = '';
    if (master || master !== '') {
      hash = await Paz.hash(master, site);
    }
    else {
      hash = '';
    }
    console.log('Site data:', site);
    console.log('Computed hash:', hash);
    this.elements.hash.value = hash;
    this.elements.replication.value = JSON.stringify(site, null, 2);
  }
  public show(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (element.style.display === 'none' || element.style.display === '') {
      element.style.display = 'block';
    }
    else {
      element.style.display = 'none';
    }
  }
  public clear(elementId: string): void {
    const element = document.getElementById(elementId) as HTMLInputElement;
    if (element) {
      element.value = '';
    }
  }
}

const pazui = new PazUI();
// Declare a global variable for Asa
declare global {
  interface Window {
    pazui: typeof pazui;
  }
}
window.pazui = pazui;

