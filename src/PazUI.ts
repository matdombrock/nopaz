import type { PazSite } from './types';

import { Paz } from './Paz';
import getPoemLine from './poem';

type PazUIElements = {
  master: HTMLInputElement;
  site: HTMLInputElement;
  special: HTMLInputElement;
  length: HTMLInputElement;
  revision: HTMLInputElement;
  hash: HTMLInputElement;
  replication: HTMLInputElement;
  btnExtras: HTMLButtonElement;
  btnExtrasArrow: HTMLSpanElement;
  uiExtrasContainer: HTMLDivElement;
  btnView: HTMLButtonElement;
  btnReset: HTMLButtonElement;
  tipClip: HTMLDivElement;
  tipClipBtn: HTMLDivElement;
}


class PazUI {
  private elements: PazUIElements;
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
      btnExtrasArrow: document.getElementById('btn-extras-arrow') as HTMLSpanElement,
      uiExtrasContainer: document.getElementById('ui-extras-container') as HTMLDivElement,
      btnView: document.getElementById('btn-view') as HTMLButtonElement,
      btnReset: document.getElementById('btn-reset') as HTMLButtonElement,
      tipClip: document.getElementById('tip-clip') as HTMLDivElement,
      tipClipBtn: document.getElementById('tip-clip-btm') as HTMLDivElement,
    };
    this.elements.master.addEventListener('input', () => this.computeHash());
    this.elements.site.addEventListener('input', () => this.computeHash());
    this.elements.special.addEventListener('input', () => this.computeHash());
    this.elements.length.addEventListener('input', () => this.computeHash());
    this.elements.revision.addEventListener('input', () => this.computeHash());
    this.elements.replication.addEventListener('input', () => this.import());

    // Set default values
    this.clearAll();

    // Check query parameters
    const urlParams = new URLSearchParams(window.location.search);
    this.elements.site.value = urlParams.get('site') || this.elements.site.value;
    this.elements.special.value = urlParams.get('special') || this.elements.special.value;
    this.elements.length.value = urlParams.get('length') || this.elements.length.value;
    this.elements.revision.value = urlParams.get('revision') || this.elements.revision.value;

    this.elements.master.focus();

    // Toggle extras
    this.elements.btnExtras.addEventListener('click', () => {
      if (this.elements.uiExtrasContainer.style.display === 'none' || this.elements.uiExtrasContainer.style.display === '') {
        this.elements.uiExtrasContainer.style.display = 'block';
        this.elements.btnExtrasArrow.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
      } else {
        this.elements.uiExtrasContainer.style.display = 'none';
        this.elements.btnExtrasArrow.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
      }
    });

    // Copy hash to clipboard
    this.elements.hash.addEventListener('click', () => {
      if (!this.elements.hash.value || this.elements.hash.value === '') {
        return
      };
      this.elements.hash.select();
      document.execCommand('copy');
      this.elements.tipClipBtn.innerHTML = `
        <strong><i class="fa-solid fa-circle-check"></i> Password copied to clipboard!</strong>
        <br><br> 
        Use the <i class="fa-solid fa-book"></i> button to make a backup of your site settings.
        <br>
        Use the <i class="fa-solid fa-paste"></i> button to load these settings later.`;
      this.elements.tipClipBtn.style.display = 'block';
    });

    // Clear inputs
    this.elements.btnReset.addEventListener('click', () => this.clearAll());

    // Toggle view
    this.elements.btnView.addEventListener('click', () => this.toggleView());
  }
  private siteINIFromSite(site: PazSite): string {
    return `[${site.siteId}]
special = ${site.special}
length = ${site.length}
revision = ${site.revision}
`;
  }
  private siteFromINI(ini: string): PazSite | null {
    const lines = ini.split('\n');
    const site: Partial<PazSite> = {};
    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key && value) {
        switch (key.trim()) {
          case 'special':
            site.special = value.trim();
            break;
          case 'length':
            site.length = parseInt(value.trim(), 10);
            break;
          case 'revision':
            site.revision = parseInt(value.trim(), 10);
            break;
        }
      }
      // Extract siteId from the section header
      // e.g., [siteId]
      if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
        site.siteId = line.trim().slice(1, -1);
      }
    }
    if (!site.siteId || !site.special || !site.special || !site.revision) {
      return null;
    }
    return site as PazSite;
  }

  public import(): void {
    const replicationValue = this.elements.replication.value;
    const replicationJSON = this.siteFromINI(replicationValue);
    if (!replicationJSON) {
      this.elements.tipClip.innerText = 'Error: Invalid replication data.';
      this.elements.tipClip.style.display = 'block';
      return;
    }
    this.elements.site.value = replicationJSON.siteId;
    this.elements.special.value = replicationJSON.special;
    this.elements.length.value = replicationJSON.length.toString();
    this.elements.revision.value = replicationJSON.revision.toString();
    this.elements.tipClip.innerHTML = '<i class="fa-solid fa-circle-check"></i> Imported replication data.';
    this.elements.tipClip.style.display = 'block';
    this.computeHash();

    this.elements.replication.style.display = 'none';
    this.elements.tipClip.innerText = 'Imported replication data.';
    this.elements.tipClip.style.display = 'block';
  }
  public async computeHash(): Promise<void> {
    console.log('Computing hash...');
    const site: PazSite = {
      siteId: this.elements.site.value,
      special: this.elements.special.value,
      length: parseInt(this.elements.length.value, 10),
      revision: parseInt(this.elements.revision.value, 10),
    };
    const master = this.elements.master.value;
    let hash = '';
    if (master !== '' && site.siteId !== '') {
      hash = await Paz.hash(master, site);
    }
    else if (master === '') {
      hash = '';
      this.elements.hash.placeholder = 'Waiting For Passphrase...';
    }
    else if (site.siteId === '') {
      hash = '';
      this.elements.hash.placeholder = 'Waiting For Site Name...';
    }
    else {
      hash = '';
    }
    console.log('Site data:', site);
    console.log('Computed hash:', hash);
    this.elements.hash.value = hash;
    this.elements.replication.value = this.siteINIFromSite(site);

    this.elements.tipClip.style.display = 'none';

    // Set the URL query parameters
    const url = new URL(window.location.href);
    url.searchParams.set('site', site.siteId);
    url.searchParams.set('special', site.special);
    url.searchParams.set('length', site.length.toString());
    url.searchParams.set('revision', site.revision.toString());
    window.history.replaceState({}, '', url.toString());
  }
  public toggleView(): void {
    this.elements.master.type = this.elements.master.type === 'password' ? 'text' : 'password';

    this.elements.hash.type = this.elements.hash.type === 'password' ? 'text' : 'password';

    this.elements.btnView.innerHTML = (this.elements.master.type === 'password') ?
      '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
  }
  public showTip(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (element.style.display === 'none' || element.style.display === '') {
      element.style.display = 'block';
    }
    else {
      element.style.display = 'none';
    }
  }
  public clearAll(): void {
    this.elements.master.value = '';
    this.elements.site.value = '';
    this.elements.special.value = 'all';
    this.elements.length.value = '16';
    this.elements.revision.value = '1';
    this.elements.master.placeholder = getPoemLine();
    this.elements.hash.value = '';
    this.elements.replication.value = '';
    this.elements.master.placeholder = getPoemLine();
    this.elements.tipClip.style.display = 'none';
    this.elements.tipClipBtn.style.display = 'none';
    this.computeHash();
  }
  public clear(elementId: string): void {
    const element = document.getElementById(elementId) as HTMLInputElement;
    if (element) {
      element.value = '';
    }
    this.computeHash();
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

