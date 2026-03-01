const el = (id) => document.getElementById(id);

const lengthInput = el("length");
const lengthValue = el("lengthValue");

const useLower = el("useLower");
const useUpper = el("useUpper");
const useNumbers = el("useNumbers");
const useSymbols = el("useSymbols");

const result = el("result");
const copyBtn = el("copyBtn");

const generateBtn = el("generateBtn");
const shuffleBtn = el("shuffleBtn");
const clearBtn = el("clearBtn");

const strengthBar = el("strengthBar");
const strengthLabel = el("strengthLabel");
const hint = el("hint");
const toast = el("toast");

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMS = "0123456789";
const SYMS = "!@#$%^&*()-_=+[]{};:,.<>/?~";

function toastMsg(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => toast.classList.remove("show"), 1200);
}

function getPool() {
  let pool = "";
  if (useLower.checked) pool += LOWER;
  if (useUpper.checked) pool += UPPER;
  if (useNumbers.checked) pool += NUMS;
  if (useSymbols.checked) pool += SYMS;
  return pool;
}

function randInt(maxExclusive) {
  if (window.crypto && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function pick(pool) {
  return pool[randInt(pool.length)];
}

function shuffleString(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function ensureAtLeastOneFromEachSelected(length, selections) {
  const forced = [];
  for (const s of selections) {
    if (s.enabled) forced.push(pick(s.chars));
  }
  return forced.slice(0, Math.min(forced.length, length));
}

function generatePassword() {
  const length = Number(lengthInput.value);
  const pool = getPool();

  if (!pool) {
    hint.textContent = "En az 1 seçenek seç (küçük/büyük/sayı/sembol).";
    return "";
  }

  hint.textContent = "";

  const selections = [
    { enabled: useLower.checked, chars: LOWER },
    { enabled: useUpper.checked, chars: UPPER },
    { enabled: useNumbers.checked, chars: NUMS },
    { enabled: useSymbols.checked, chars: SYMS },
  ];

  let out = ensureAtLeastOneFromEachSelected(length, selections).join("");
  while (out.length < length) out += pick(pool);
  out = shuffleString(out);

  return out;
}

function estimateStrength(pw) {
  if (!pw) return { score: 0, label: "—", percent: 0, tip: "" };

  const length = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSym = /[^a-zA-Z0-9]/.test(pw);

  const variety = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;

  let score = 0;
  if (length >= 6) score += 10;
  if (length >= 10) score += 15;
  if (length >= 14) score += 20;
  if (length >= 18) score += 15;

  score += variety * 12;

  const repeats = pw.split("").filter((c, i, a) => a.indexOf(c) !== i).length;
  if (repeats > length / 2) score -= 10;

  score = Math.max(0, Math.min(100, score));

  let label = "Weak";
  if (score >= 75) label = "Strong";
  else if (score >= 50) label = "Good";
  else if (score >= 30) label = "Okay";

  const percent = score;

  let tip = "";
  if (score < 30) tip = "Uzunluğu artır + en az 3 karakter türü kullan.";
  else if (score < 50) tip = "Bir karakter türü daha ekle (örn. sembol) veya uzunluğu 14+ yap.";
  else if (score < 75) tip = "Gayet iyi. 16+ ve sembol ile daha da güçlenir.";
  else tip = "İyi. Bu şifre güçlü görünüyor.";

  return { score, label, percent, tip };
}

function renderStrength(pw) {
  const s = estimateStrength(pw);
  strengthLabel.textContent = s.label;
  strengthBar.style.width = `${s.percent}%`;
  hint.textContent = s.tip || "";
}

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
  if (result.value) renderStrength(result.value);
});

function doGenerate() {
  const pw = generatePassword();
  result.value = pw;
  renderStrength(pw);
  if (pw) toastMsg("Şifre üretildi.");
}

generateBtn.addEventListener("click", doGenerate);
shuffleBtn.addEventListener("click", doGenerate);

clearBtn.addEventListener("click", () => {
  result.value = "";
  strengthLabel.textContent = "—";
  strengthBar.style.width = "0%";
  hint.textContent = "";
  toastMsg("Temizlendi.");
});

copyBtn.addEventListener("click", async () => {
  const pw = result.value;
  if (!pw) return toastMsg("Önce şifre üret.");

  try {
    await navigator.clipboard.writeText(pw);
    toastMsg("Kopyalandı ✅");
  } catch {
    result.select();
    document.execCommand("copy");
    toastMsg("Kopyalandı ✅");
  }
});

lengthValue.textContent = lengthInput.value;