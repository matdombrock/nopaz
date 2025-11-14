type Site = {
  siteId: string;
  special: string;
  length: number;
  revision: number;
}


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
}


class Paz {
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
    };
    this.elements.master.addEventListener('input', () => this.computeHash());
    this.elements.site.addEventListener('input', () => this.computeHash());
    this.elements.special.addEventListener('input', () => this.computeHash());
    this.elements.length.addEventListener('input', () => this.computeHash());
    this.elements.revision.addEventListener('input', () => this.computeHash());
    this.elements.replication.addEventListener('input', () => this.replicationInput());

    // Set default values
    this.elements.master.value = '';
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
  }
  private async hash(master: string, site: Site): Promise<string> {
    // Combine all relevant fields for deterministic hashing
    const input = `${master}:${site.siteId}:${site.special}:${site.length}:${site.revision}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Truncate to desired length
    // Return only the first 'length' characters
    // Assuming length is in characters, not bytes
    const truncatedHash = hashHex.slice(0, site.length);
    // Repace the end of the hash with special characters if provided
    if (site.special) {
      const specialLength = site.special.length;
      return truncatedHash.slice(0, -specialLength) + site.special;
    }
    return truncatedHash;
  }
  public replicationInput(): void {
    const replicationValue = this.elements.replication.value;
    const replicationJSON = JSON.parse(replicationValue);
    this.elements.site.value = replicationJSON.domain;
    this.elements.special.value = replicationJSON.special;
    this.elements.length.value = replicationJSON.length.toString();
    this.elements.revision.value = replicationJSON.revision.toString();
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
    const hash = await this.hash(master, site);
    console.log('Site data:', site);
    console.log('Computed hash:', hash);
    this.elements.hash.value = hash;
    this.elements.replication.value = JSON.stringify(site, null, 2);
  }
}

new Paz();
