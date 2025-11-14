// src/Paz.ts
class Paz {
  static async hash(master, site) {
    const input = `${master}:${site.siteId}:${site.special}:${site.length}:${site.revision}`;
    const encoder = new TextEncoder;
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const truncatedHash = hashHex.slice(0, site.length);
    if (site.special) {
      const specialLength = site.special.length;
      return truncatedHash.slice(0, -specialLength) + site.special;
    }
    return truncatedHash;
  }
}

// src/poem.ts
var poem = [
  "Out of the Rolling Ocean the Crowd",
  "When I Heard the Learn’d Astronomer",
  "I Sing the Body Electric",
  "I Dream’d in a Dream",
  "The Ship Starting",
  "On the Beach at Night Alone",
  "Sometimes with One I Love",
  "A Noiseless Patient Spider",
  "Beginning My Studies",
  "I Saw in Louisiana A Live-Oak Growing",
  "In Paths Untrodden",
  "As I Walk These Broad Majestic Days",
  "Crossing Brooklyn Ferry",
  "To the Garden the World",
  "A Song to Myself"
];
function getPoemLine() {
  const lineNumber = Math.floor(Math.random() * poem.length) + 1;
  if (lineNumber < 1 || lineNumber > poem.length) {
    throw new Error("Line number out of range");
  }
  return poem[lineNumber - 1] || "The quick brown fox jumps over the lazy dog.";
}

// src/PazUI.ts
class PazUI {
  elements;
  constructor() {
    this.elements = {
      master: document.getElementById("in-master"),
      site: document.getElementById("in-site"),
      special: document.getElementById("in-special"),
      length: document.getElementById("in-length"),
      revision: document.getElementById("in-revision"),
      hash: document.getElementById("out-hash"),
      replication: document.getElementById("io-replication"),
      btnExtras: document.getElementById("btn-extras"),
      btnExtrasArrow: document.getElementById("btn-extras-arrow"),
      uiExtrasContainer: document.getElementById("ui-extras-container"),
      btnImport: document.getElementById("btn-import"),
      btnExport: document.getElementById("btn-export"),
      btnView: document.getElementById("btn-view"),
      tipClip: document.getElementById("tip-clip")
    };
    this.elements.master.addEventListener("input", () => this.computeHash());
    this.elements.site.addEventListener("input", () => this.computeHash());
    this.elements.special.addEventListener("input", () => this.computeHash());
    this.elements.length.addEventListener("input", () => this.computeHash());
    this.elements.revision.addEventListener("input", () => this.computeHash());
    this.elements.replication.addEventListener("input", () => this.import());
    this.elements.master.value = "";
    this.elements.master.placeholder = getPoemLine();
    this.elements.site.value = "";
    this.elements.length.value = "16";
    this.elements.revision.value = "1";
    this.elements.special.value = "all";
    this.elements.hash.value = "";
    this.elements.master.focus();
    this.elements.btnExtras.addEventListener("click", () => {
      if (this.elements.uiExtrasContainer.style.display === "none" || this.elements.uiExtrasContainer.style.display === "") {
        this.elements.uiExtrasContainer.style.display = "block";
        this.elements.btnExtrasArrow.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
      } else {
        this.elements.uiExtrasContainer.style.display = "none";
        this.elements.btnExtrasArrow.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
      }
    });
    this.elements.btnExport.addEventListener("click", () => {
      if (this.elements.replication.style.display === "none" || this.elements.replication.style.display === "") {
        this.elements.replication.style.display = "block";
      } else {
        this.elements.replication.style.display = "none";
      }
    });
    this.elements.hash.addEventListener("click", () => {
      if (!this.elements.hash.value || this.elements.hash.value === "") {
        return;
      }
      this.elements.hash.select();
      document.execCommand("copy");
      this.elements.tipClip.innerHTML = `
        <strong><i class="fa-solid fa-circle-check"></i> Password copied to clipboard!</strong>
        <br><br> 
        Use the <i class="fa-solid fa-book"></i> button to make a backup of your site settings.
        <br>
        Use the <i class="fa-solid fa-paste"></i> button to load these settings later.`;
      this.elements.tipClip.style.display = "block";
    });
    this.elements.btnView.addEventListener("click", () => this.toggleView());
  }
  import() {
    const replicationValue = this.elements.replication.value;
    const replicationJSON = JSON.parse(replicationValue);
    this.elements.site.value = replicationJSON.domain;
    this.elements.special.value = replicationJSON.special;
    this.elements.length.value = replicationJSON.length.toString();
    this.elements.revision.value = replicationJSON.revision.toString();
    this.elements.tipClip.innerText = "Imported replication data.";
    this.elements.tipClip.style.display = "block";
    this.computeHash();
  }
  async computeHash() {
    console.log("Computing hash...");
    const site = {
      siteId: this.elements.site.value,
      special: this.elements.special.value,
      length: parseInt(this.elements.length.value, 10),
      revision: parseInt(this.elements.revision.value, 10)
    };
    const master = this.elements.master.value;
    let hash = "";
    if (master !== "" && site.siteId !== "") {
      hash = await Paz.hash(master, site);
    } else if (master === "") {
      hash = "";
      this.elements.hash.placeholder = "Waiting For Passphrase...";
    } else if (site.siteId === "") {
      hash = "";
      this.elements.hash.placeholder = "Waiting For Site Name...";
    } else {
      hash = "";
    }
    console.log("Site data:", site);
    console.log("Computed hash:", hash);
    this.elements.hash.value = hash;
    this.elements.replication.value = JSON.stringify(site, null, 2);
    this.elements.tipClip.style.display = "none";
  }
  toggleView() {
    this.elements.master.type = this.elements.master.type === "password" ? "text" : "password";
    this.elements.hash.type = this.elements.hash.type === "password" ? "text" : "password";
    this.elements.btnView.innerHTML = this.elements.master.type === "password" ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
  }
  showTip(elementId) {
    const element = document.getElementById(elementId);
    if (!element)
      return;
    if (element.style.display === "none" || element.style.display === "") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  }
  clear(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = "";
    }
    this.computeHash();
  }
}
var pazui = new PazUI;
window.pazui = pazui;
