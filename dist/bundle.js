// src/Paz.ts
function customBase64Encode(buffer) {
  const bytes = new Uint8Array(buffer);
  let b64 = btoa(String.fromCharCode(...bytes));
  b64 = b64.replace(/\+/g, "9").replace(/\//g, "8");
  b64 = b64.replace(/=+$/, (match) => "A".repeat(match.length));
  return b64;
}
function satisfiesRules(password) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const startsLower = /^[a-z]/.test(password);
  return hasUpper && hasLower && hasNumber && startsLower;
}

class Paz {
  static async hash(master, site) {
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get("debug") === "1";
    if (debug) {
      console.log("Paz debug mode enabled.");
      console.log(`Master: ${master}`);
      console.log(`Site: ${JSON.stringify(site)}`);
    }
    let source = `${master}:${site.siteId}`;
    if (typeof site.revision === "number" && site.revision > 0) {
      source += `${site.revision}`;
    }
    if (debug)
      console.log(`Initial source: ${source}`);
    const minIterations = site.minIterations ?? 1;
    const passwordLength = site.length ?? 12;
    const addition = site.append ?? "";
    let hashSource = source;
    let iteration = 0;
    let password = "";
    const algorithms = {
      sha512: "SHA-512",
      sha256: "SHA-256",
      "SHA-512": "SHA-512",
      "SHA-256": "SHA-256"
    };
    if (algorithms[site.algorithm] === undefined && debug) {
      console.warn(`Unknown algorithm "${site.algorithm}", defaulting to SHA-512.`);
    }
    const algorithm = algorithms[site.algorithm] || "SHA-512";
    while (true) {
      const encoder = new TextEncoder;
      const data = encoder.encode(hashSource);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hash = customBase64Encode(hashBuffer);
      if (debug)
        console.log(`Iteration ${iteration}: hash=${hash}`);
      password = hash.slice(0, passwordLength);
      iteration += 1;
      if (iteration < minIterations) {
        hashSource = hash;
        continue;
      }
      if (!satisfiesRules(password)) {
        hashSource = hash;
        continue;
      }
      break;
    }
    if (debug)
      console.log(`Paz generated password in ${iteration} iterations.`);
    return `${password}${addition}`;
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
      note: document.getElementById("in-note"),
      minIterations: document.getElementById("in-min-iterations"),
      algorithm: document.getElementById("in-algorithm"),
      append: document.getElementById("in-append"),
      btnExtras: document.getElementById("btn-extras"),
      btnExtrasArrow: document.getElementById("btn-extras-arrow"),
      uiExtrasContainer: document.getElementById("ui-extras-container"),
      uiAdvancedContainer: document.getElementById("ui-advanced-container"),
      btnView: document.getElementById("btn-view"),
      btnBookmark: document.getElementById("btn-bookmark"),
      btnReset: document.getElementById("btn-reset"),
      tipClip: document.getElementById("tip-clip"),
      tipClipBtn: document.getElementById("tip-clip-btm")
    };
    this.elements.master.addEventListener("input", () => this.computeHash());
    this.elements.site.addEventListener("input", () => this.computeHash());
    this.elements.special.addEventListener("input", () => this.computeHash());
    this.elements.length.addEventListener("input", () => this.computeHash());
    this.elements.revision.addEventListener("input", () => this.computeHash());
    this.elements.note.addEventListener("input", () => this.computeHash());
    this.elements.minIterations.addEventListener("input", () => this.computeHash());
    this.elements.append.addEventListener("input", () => this.computeHash());
    this.elements.algorithm.addEventListener("input", () => this.computeHash());
    this.clearAll(false, false);
    const urlParams = this.getQueryParams();
    const advanced = urlParams.get("adv") === "1";
    if (advanced) {
      this.elements.uiAdvancedContainer.style.display = "block";
    } else {
      this.elements.uiAdvancedContainer.style.display = "none";
    }
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
    this.elements.hash.addEventListener("click", () => {
      if (!this.elements.hash.value || this.elements.hash.value === "") {
        return;
      }
      this.elements.hash.select();
      document.execCommand("copy");
      this.elements.tipClipBtn.innerHTML = `
        <strong><i class="fa-solid fa-circle-check"></i> Password copied to clipboard!</strong>`;
      this.elements.tipClipBtn.style.display = "block";
    });
    this.elements.btnBookmark.addEventListener("click", () => {
      const site = this.captureSite();
      const url = this.updateQueryParams(site);
      navigator.clipboard.writeText(url.toString());
      this.elements.tipClip.innerHTML = `<i class="fa-solid fa-circle-check"></i> Bookmark URL copied to clipboard.
      <br><br>
      Use ctrl/cmd + D to bookmark it in your browser!`;
      this.elements.tipClip.style.display = "block";
    });
    this.elements.btnReset.addEventListener("click", () => this.clearAll(true, true));
    this.elements.btnView.addEventListener("click", () => this.toggleView());
  }
  getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.elements.site.value = urlParams.get("site") || this.elements.site.value;
    this.elements.special.value = urlParams.get("special") || this.elements.special.value;
    this.elements.length.value = urlParams.get("length") || this.elements.length.value;
    this.elements.revision.value = urlParams.get("revision") || this.elements.revision.value;
    this.elements.note.value = urlParams.get("note") || this.elements.note.value;
    this.elements.minIterations.value = urlParams.get("minIterations") || this.elements.minIterations.value;
    this.elements.append.value = urlParams.get("append") || this.elements.append.value;
    this.elements.algorithm.value = urlParams.get("algorithm") || this.elements.algorithm.value;
    return urlParams;
  }
  updateQueryParams(site) {
    const url = new URL(window.location.href);
    url.searchParams.set("site", site.siteId);
    url.searchParams.set("special", site.special);
    url.searchParams.set("length", site.length.toString());
    url.searchParams.set("revision", site.revision.toString());
    url.searchParams.set("note", this.elements.note.value);
    url.searchParams.set("minIterations", site.minIterations.toString());
    url.searchParams.set("append", site.append);
    url.searchParams.set("algorithm", site.algorithm);
    return url;
  }
  clearQueryParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete("site");
    url.searchParams.delete("special");
    url.searchParams.delete("length");
    url.searchParams.delete("revision");
    url.searchParams.delete("note");
    url.searchParams.delete("minIterations");
    url.searchParams.delete("append");
    url.searchParams.delete("algorithm");
    window.history.replaceState({}, "", url.toString());
  }
  captureSite() {
    return {
      siteId: this.elements.site.value,
      special: this.elements.special.value,
      length: parseInt(this.elements.length.value, 10),
      revision: parseInt(this.elements.revision.value, 10),
      note: this.elements.note.value,
      minIterations: parseInt(this.elements.minIterations.value, 10),
      algorithm: this.elements.algorithm.value,
      append: this.elements.append.value
    };
  }
  async computeHash() {
    console.log("Computing hash...");
    const site = this.captureSite();
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
    this.elements.tipClip.style.display = "none";
    const url = this.updateQueryParams(site);
    window.history.replaceState({}, "", url.toString());
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
  clearAll(compute, query) {
    this.elements.master.value = "";
    this.elements.site.value = "";
    this.elements.special.value = "all";
    this.elements.length.value = "16";
    this.elements.revision.value = "1";
    this.elements.master.placeholder = getPoemLine();
    this.elements.hash.value = "";
    this.elements.replication.value = "";
    this.elements.minIterations.value = "10";
    this.elements.algorithm.value = "sha512";
    this.elements.append.value = "";
    this.elements.master.placeholder = getPoemLine();
    this.elements.tipClip.style.display = "none";
    this.elements.tipClipBtn.style.display = "none";
    if (compute) {
      this.computeHash();
    }
    if (query) {
      this.clearQueryParams();
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
