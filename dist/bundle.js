// src/dbg.ts
function dbg(message) {
  const urlParams = new URLSearchParams(window.location.search);
  const isDbg = urlParams.get("debug") === "1";
  if (isDbg) {
    console.log(message);
  }
}

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
    dbg("Paz debug mode enabled.");
    dbg(`Master: ${master}`);
    dbg(`Site: ${JSON.stringify(site)}`);
    let source = `${master}:${site.siteId}`;
    if (typeof site.revision === "number" && site.revision > 0) {
      source += `${site.revision}`;
    }
    dbg(`Initial source: ${source}`);
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
    if (algorithms[site.algorithm] === undefined) {
      dbg(`Unknown algorithm "${site.algorithm}", defaulting to SHA-512.`);
    }
    const algorithm = algorithms[site.algorithm] || "SHA-512";
    while (true) {
      const encoder = new TextEncoder;
      const data = encoder.encode(hashSource);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hash = customBase64Encode(hashBuffer);
      dbg(`Iteration ${iteration}: hash=${hash}`);
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
    dbg(`Paz generated password in ${iteration} iterations.`);
    return `${password}${addition}`;
  }
}

// src/RNG.ts
class RNG {
  seed;
  constructor(seed) {
    this.seed = RNG.hash(seed.toString()) >>> 0;
  }
  static hash(input) {
    let hash = 0;
    for (let i = 0;i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash >>> 0;
  }
  warm(iterations = 10) {
    for (let i = 0;i < iterations; i++) {
      this.get();
    }
    return this;
  }
  get() {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    let seed = this.seed;
    seed = (a * seed + c) % m;
    this.seed = (a * seed + c) % m;
    return seed / m;
  }
}

// src/Special.ts
class Special {
  static replace(password, char, position) {
    return password.substring(0, position) + char + password.substring(position + 1);
  }
  static rPositions(password, count) {
    const rng = new RNG(password);
    const positions = new Set;
    while (positions.size < count) {
      const pos = Math.floor(rng.get() * password.length);
      positions.add(pos);
    }
    return Array.from(positions);
  }
  static rUpperChar(password) {
    const rng = new RNG(password);
    const char = 65 + Math.floor(rng.get() * 26);
    return String.fromCharCode(char);
  }
  static rNumberChar(password) {
    const rng = new RNG(password);
    const char = 48 + Math.floor(rng.get() * 10);
    return String.fromCharCode(char);
  }
  static rSpecialChar(password) {
    const rng = new RNG(password);
    const char = 33 + Math.floor(rng.get() * 15);
    return String.fromCharCode(char);
  }
  static mNone(password) {
    return password;
  }
  static mDefault(password) {
    const upperCharCode = Special.rUpperChar(password);
    const numberCharCode = Special.rNumberChar(password);
    const specialCharCode = Special.rSpecialChar(password);
    const rpos = Special.rPositions(password, 3);
    password = Special.replace(password, upperCharCode, rpos[0]);
    password = Special.replace(password, numberCharCode, rpos[1]);
    password = Special.replace(password, specialCharCode, rpos[2]);
    return password;
  }
  static mNumber(password) {
    const numberCharCode = Special.rNumberChar(password);
    const rpos = Special.rPositions(password, 1);
    password = Special.replace(password, numberCharCode, rpos[0]);
    return password;
  }
  static mSpecial(password) {
    const specialCharCode = Special.rSpecialChar(password);
    const rpos = Special.rPositions(password, 1);
    password = Special.replace(password, specialCharCode, rpos[0]);
    return password;
  }
  static modes = {
    default: Special.mDefault,
    number: Special.mNumber,
    special: Special.mSpecial,
    none: Special.mNone
  };
  static generate(password, mode) {
    const func = Special.modes[mode] || Special.mNone;
    return func(password);
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

// src/emoji.ts
function passphraseEmoji(passphrase) {
  const start = 128512;
  const end = 128591;
  const rng = new RNG(passphrase);
  rng.warm(5);
  const codePoint = start + Math.floor(rng.get() * (end - start + 1));
  const emoji = String.fromCodePoint(codePoint);
  return emoji;
}

// src/PazUI.ts
class PazUI {
  elements;
  state = {
    hidden: false
  };
  constructor() {
    this.elements = {
      master: document.getElementById("in-master"),
      passphraseEmpji: document.getElementById("passphrase-emoji"),
      site: document.getElementById("in-site"),
      special: document.getElementById("in-special"),
      length: document.getElementById("in-length"),
      revision: document.getElementById("in-revision"),
      hash: document.getElementById("out-hash"),
      notes: document.getElementById("in-notes"),
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
    this.elements.notes.addEventListener("input", () => this.computeHash());
    this.elements.minIterations.addEventListener("input", () => this.computeHash());
    this.elements.append.addEventListener("input", () => this.computeHash());
    this.elements.algorithm.addEventListener("input", () => this.computeHash());
    this.clearAll(false, false);
    this.getSiteQueryParams();
    const urlParams = new URLSearchParams(window.location.search);
    const advanced = urlParams.get("adv") === "1";
    if (advanced) {
      this.elements.uiAdvancedContainer.style.display = "block";
    } else {
      this.elements.uiAdvancedContainer.style.display = "none";
    }
    this.elements.master.focus();
    this.elements.btnExtras.addEventListener("click", () => this.toggleExtras());
    this.elements.hash.addEventListener("click", () => this.copyHash());
    this.elements.btnBookmark.addEventListener("click", () => this.bookmark());
    this.elements.btnReset.addEventListener("click", () => this.clearAll(true, true));
    this.elements.btnView.addEventListener("click", () => this.toggleView());
    this.elements.passphraseEmpji.innerText = passphraseEmoji("");
  }
  getSiteQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.elements.site.value = urlParams.get("site") || this.elements.site.value;
    this.elements.special.value = urlParams.get("special") || this.elements.special.value;
    this.elements.length.value = urlParams.get("length") || this.elements.length.value;
    this.elements.revision.value = urlParams.get("revision") || this.elements.revision.value;
    this.elements.notes.value = urlParams.get("notes") || this.elements.notes.value;
    this.elements.minIterations.value = urlParams.get("minIterations") || this.elements.minIterations.value;
    this.elements.append.value = urlParams.get("append") || this.elements.append.value;
    this.elements.algorithm.value = urlParams.get("algorithm") || this.elements.algorithm.value;
  }
  updateSiteQueryParams(site) {
    const url = new URL(window.location.href);
    url.searchParams.set("site", site.siteId);
    url.searchParams.set("special", site.special);
    url.searchParams.set("length", site.length.toString());
    url.searchParams.set("revision", site.revision.toString());
    url.searchParams.set("notes", this.elements.notes.value);
    url.searchParams.set("minIterations", site.minIterations.toString());
    url.searchParams.set("append", site.append);
    url.searchParams.set("algorithm", site.algorithm);
    window.history.replaceState({}, "", url.toString());
  }
  clearSiteQueryParams() {
    const url = new URL(window.location.href);
    url.searchParams.delete("site");
    url.searchParams.delete("special");
    url.searchParams.delete("length");
    url.searchParams.delete("revision");
    url.searchParams.delete("notes");
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
      note: this.elements.notes.value,
      minIterations: parseInt(this.elements.minIterations.value, 10),
      algorithm: this.elements.algorithm.value,
      append: this.elements.append.value
    };
  }
  async computeHash() {
    dbg("Computing hash...");
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
    if (hash !== "") {
      hash = Special.generate(hash, site.special);
    }
    dbg("Site data: " + JSON.stringify(site));
    dbg("Computed hash: " + hash);
    this.elements.hash.value = hash;
    this.elements.tipClip.style.display = "none";
    this.updateSiteQueryParams(site);
    const url = new URL(window.location.href);
    window.history.replaceState({}, "", url.toString());
    this.elements.passphraseEmpji.innerText = passphraseEmoji(master);
  }
  toggleView() {
    let hidden = this.state.hidden;
    hidden = !hidden;
    this.state.hidden = hidden;
    this.elements.btnView.innerHTML = hidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    if (!hidden) {
      dbg("Hiding input-hider elements");
      const inputHiders = document.getElementsByClassName("input-hider");
      for (let i = 0;i < inputHiders.length; i++) {
        const element = inputHiders[i];
        element.style.display = "none";
      }
    } else {
      dbg("Showing input-hider elements");
      const inputHiders = document.getElementsByClassName("input-hider");
      for (let i = 0;i < inputHiders.length; i++) {
        const element = inputHiders[i];
        element.style.display = "block";
      }
    }
  }
  copyHash() {
    if (!this.elements.hash.value || this.elements.hash.value === "") {
      return;
    }
    this.elements.hash.select();
    document.execCommand("copy");
    this.elements.tipClipBtn.innerHTML = `
        <strong><i class="fa-solid fa-circle-check"></i> Password copied to clipboard!</strong>`;
    this.elements.tipClipBtn.style.display = "block";
  }
  toggleExtras() {
    if (this.elements.uiExtrasContainer.style.display === "none" || this.elements.uiExtrasContainer.style.display === "") {
      this.elements.uiExtrasContainer.style.display = "block";
      this.elements.btnExtrasArrow.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    } else {
      this.elements.uiExtrasContainer.style.display = "none";
      this.elements.btnExtrasArrow.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    }
  }
  bookmark() {
    const site = this.captureSite();
    this.updateSiteQueryParams(site);
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
    this.elements.tipClip.innerHTML = `<i class="fa-solid fa-circle-check"></i> Bookmark URL copied to clipboard.
      <br><br>
      Use ctrl/cmd + D to bookmark it in your browser!`;
    this.elements.tipClip.style.display = "block";
  }
  clearAll(compute, query) {
    this.elements.master.value = "";
    this.elements.site.value = "";
    this.elements.special.value = "default";
    this.elements.length.value = "16";
    this.elements.revision.value = "1";
    this.elements.master.placeholder = getPoemLine();
    this.elements.hash.value = "";
    this.elements.notes.value = "";
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
      this.clearSiteQueryParams();
    }
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
