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
const strengthPercent = el("strengthPercent");
const hint = el("hint");
const toast = el("toast");

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMS = "0123456789";
const SYMS = "!@#$%^&*()-_=+[]{};:,.<>/?~";

function showToast(message) {
  toast.textContent = message;
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

function ensureSelectedTypes(length, selections) {
  const forced = [];
  for (const item of selections) {
    if (item.enabled) forced.push(pick(item.chars));
  }
  return forced.slice(0, Math.min(length, forced.length));
}

function generatePassword() {
  const length = Number(lengthInput.value);
  const pool = getPool();

  if (!pool) {
    hint.textContent = "En az 1 karakter tipi seçmelisin.";
    showToast("Önce en az 1 seçenek seç.");
    return "";
  }

  const selections = [
    { enabled: useLower.checked, chars: LOWER },
    { enabled: useUpper.checked, chars: UPPER },
    { enabled: useNumbers.checked, chars: NUMS },
    { enabled: useSymbols.checked, chars: SYMS },
  ];

  let password = ensureSelectedTypes(length, selections).join("");

  while (password.length < length) {
    password += pick(pool);
  }

  return shuffleString(password);
}

function estimateStrength(password) {
  if (!password) {
    return { score: 0, label: "—", tip: "" };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  let score = 0;

  if (length >= 6) score += 10;
  if (length >= 10) score += 15;
  if (length >= 14) score += 20;
  if (length >= 18) score += 15;

  score += variety * 12;

  const repeats = password.split("").filter((char, index, arr) => arr.indexOf(char) !== index).length;
  if (repeats > length / 2) score -= 10;

  score = Math.max(0, Math.min(100, score));

  let label = "Weak";
  let tip = "Uzunluğu artır ve daha fazla karakter türü ekle.";

  if (score >= 75) {
    label = "Strong";
    tip = "Güçlü görünüyor. Uzun ve dengeli bir kombinasyon.";
  } else if (score >= 50) {
    label = "Good";
    tip = "Gayet iyi. Biraz daha uzun yaparsan daha da güçlenir.";
  } else if (score >= 30) {
    label = "Okay";
    tip = "Fena değil ama sembol ve uzunluk eklemek iyi olur.";
  }

  return { score, label, tip };
}

function renderStrength(password) {
  const strength = estimateStrength(password);

  strengthLabel.textContent = strength.label;
  strengthPercent.textContent = `${strength.score}%`;
  strengthBar.style.width = `${strength.score}%`;
  hint.textContent = strength.tip;
}

function handleGenerate() {
  const password = generatePassword();
  result.value = password;
  renderStrength(password);

  if (password) {
    showToast("Yeni şifre üretildi.");
  }
}

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

generateBtn.addEventListener("click", handleGenerate);
shuffleBtn.addEventListener("click", handleGenerate);

clearBtn.addEventListener("click", () => {
  result.value = "";
  strengthBar.style.width = "0%";
  strengthLabel.textContent = "—";
  strengthPercent.textContent = "0%";
  hint.textContent = "";
  showToast("Alan temizlendi.");
});

copyBtn.addEventListener("click", async () => {
  if (!result.value) {
    showToast("Önce şifre üret.");
    return;
  }

  try {
    await navigator.clipboard.writeText(result.value);
    showToast("Şifre kopyalandı ✅");
    copyBtn.textContent = "Kopyalandı";
    setTimeout(() => {
      copyBtn.textContent = "Kopyala";
    }, 1000);
  } catch {
    result.select();
    document.execCommand("copy");
    showToast("Şifre kopyalandı ✅");
  }
});

lengthValue.textContent = lengthInput.value;