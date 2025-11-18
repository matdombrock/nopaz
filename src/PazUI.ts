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
  // Advanced
  minIterations: HTMLInputElement;
  algorithm: HTMLInputElement;
  append: HTMLInputElement;
  //
  btnExtras: HTMLButtonElement;
  btnExtrasArrow: HTMLSpanElement;
  uiExtrasContainer: HTMLDivElement;
  uiAdvancedContainer: HTMLDivElement;
  btnView: HTMLButtonElement;
  btnBookmark: HTMLButtonElement;
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
      minIterations: document.getElementById('in-min-iterations') as HTMLInputElement,
      algorithm: document.getElementById('in-algorithm') as HTMLInputElement,
      append: document.getElementById('in-append') as HTMLInputElement,
      btnExtras: document.getElementById('btn-extras') as HTMLButtonElement,
      btnExtrasArrow: document.getElementById('btn-extras-arrow') as HTMLSpanElement,
      uiExtrasContainer: document.getElementById('ui-extras-container') as HTMLDivElement,
      uiAdvancedContainer: document.getElementById('ui-advanced-container') as HTMLDivElement,
      btnView: document.getElementById('btn-view') as HTMLButtonElement,
      btnBookmark: document.getElementById('btn-bookmark') as HTMLButtonElement,
      btnReset: document.getElementById('btn-reset') as HTMLButtonElement,
      tipClip: document.getElementById('tip-clip') as HTMLDivElement,
      tipClipBtn: document.getElementById('tip-clip-btm') as HTMLDivElement,
    };
    // Attach event listeners
    this.elements.master.addEventListener('input', () => this.computeHash());
    this.elements.site.addEventListener('input', () => this.computeHash());
    this.elements.special.addEventListener('input', () => this.computeHash());
    this.elements.length.addEventListener('input', () => this.computeHash());
    this.elements.revision.addEventListener('input', () => this.computeHash());
    this.elements.minIterations.addEventListener('input', () => this.computeHash());
    this.elements.append.addEventListener('input', () => this.computeHash());
    this.elements.algorithm.addEventListener('input', () => this.computeHash());

    // Set default values
    this.clearAll(false, false);

    // Check query parameters
    const urlParams = this.getUrlParams();

    // Check for advanced mode
    const advanced = urlParams.get('adv') === '1';
    if (advanced) {
      this.elements.uiAdvancedContainer.style.display = 'block';
    } else {
      this.elements.uiAdvancedContainer.style.display = 'none';
    }

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
        <strong><i class="fa-solid fa-circle-check"></i> Password copied to clipboard!</strong>`;
      this.elements.tipClipBtn.style.display = 'block';
    });

    // Bookmark site settings
    this.elements.btnBookmark.addEventListener('click', () => {
      const site = this.captureSite();
      const url = this.updateQueryParams(site);
      navigator.clipboard.writeText(url.toString());
      this.elements.tipClip.innerHTML = `<i class="fa-solid fa-circle-check"></i> Bookmark URL copied to clipboard.
      <br><br>
      Use ctrl/cmd + D to bookmark it in your browser!`;
      this.elements.tipClip.style.display = 'block';
    });

    // Clear inputs
    this.elements.btnReset.addEventListener('click', () => this.clearAll(true, true));

    // Toggle view
    this.elements.btnView.addEventListener('click', () => this.toggleView());
  }
  private getUrlParams(): URLSearchParams {
    const urlParams = new URLSearchParams(window.location.search);
    this.elements.site.value = urlParams.get('site') || this.elements.site.value;
    this.elements.special.value = urlParams.get('special') || this.elements.special.value;
    this.elements.length.value = urlParams.get('length') || this.elements.length.value;
    this.elements.revision.value = urlParams.get('revision') || this.elements.revision.value;
    this.elements.minIterations.value = urlParams.get('minIterations') || this.elements.minIterations.value;
    this.elements.append.value = urlParams.get('append') || this.elements.append.value;
    this.elements.algorithm.value = urlParams.get('algorithm') || this.elements.algorithm.value;
    return urlParams;
  }
  private updateQueryParams(site: PazSite): URL {
    const url = new URL(window.location.href);
    url.searchParams.set('site', site.siteId);
    url.searchParams.set('special', site.special);
    url.searchParams.set('length', site.length.toString());
    url.searchParams.set('revision', site.revision.toString());
    url.searchParams.set('minIterations', site.minIterations.toString());
    url.searchParams.set('append', site.append);
    url.searchParams.set('algorithm', site.algorithm);
    return url;
  }
  private clearQueryParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('site');
    url.searchParams.delete('special');
    url.searchParams.delete('length');
    url.searchParams.delete('revision');
    url.searchParams.delete('minIterations');
    url.searchParams.delete('append');
    url.searchParams.delete('algorithm');
    window.history.replaceState({}, '', url.toString());
  }
  private captureSite(): PazSite {
    return {
      siteId: this.elements.site.value,
      special: this.elements.special.value,
      length: parseInt(this.elements.length.value, 10),
      revision: parseInt(this.elements.revision.value, 10),
      minIterations: parseInt(this.elements.minIterations.value, 10),
      algorithm: this.elements.algorithm.value,
      append: this.elements.append.value,
    };
  }
  private async computeHash(): Promise<void> {
    console.log('Computing hash...');
    const site = this.captureSite();
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

    this.elements.tipClip.style.display = 'none';

    // Set the URL query parameters
    const url = this.updateQueryParams(site);
    window.history.replaceState({}, '', url.toString());
  }
  private toggleView(): void {
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
  private clearAll(compute: boolean, query: boolean): void {
    this.elements.master.value = '';
    this.elements.site.value = '';
    this.elements.special.value = 'all';
    this.elements.length.value = '16';
    this.elements.revision.value = '1';
    this.elements.master.placeholder = getPoemLine();
    this.elements.hash.value = '';
    this.elements.replication.value = '';
    this.elements.minIterations.value = '10';
    this.elements.algorithm.value = 'sha512';
    this.elements.append.value = '';
    this.elements.master.placeholder = getPoemLine();
    this.elements.tipClip.style.display = 'none';
    this.elements.tipClipBtn.style.display = 'none';
    // Recompute hash if needed
    if (compute) {
      this.computeHash();
    }
    // Clear query parameters
    if (query) {
      this.clearQueryParams();
    }
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

