const result = document.getElementById("result");
const copyBtn = document.getElementById("copyBtn");
const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");

const useLower = document.getElementById("useLower");
const useUpper = document.getElementById("useUpper");
const useNumbers = document.getElementById("useNumbers");
const useSymbols = document.getElementById("useSymbols");

const generateBtn = document.getElementById("generateBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const clearBtn = document.getElementById("clearBtn");

const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const strengthLabel = document.getElementById("strengthLabel");
const strengthHint = document.getElementById("strengthHint");

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+{}[]<>?/|~=-";

function updateLengthUI() {
  lengthValue.textContent = lengthInput.value;
}

function getSelectedPools() {
  const pools = [];

  if (useLower.checked) pools.push(LOWER);
  if (useUpper.checked) pools.push(UPPER);
  if (useNumbers.checked) pools.push(NUMBERS);
  if (useSymbols.checked) pools.push(SYMBOLS);

  return pools;
}

function getRandomChar(str) {
  return str[Math.floor(Math.random() * str.length)];
}

function shuffleString(str) {
  const arr = str.split("");

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join("");
}

function generatePassword() {
  const length = Number(lengthInput.value);
  const pools = getSelectedPools();

  if (pools.length === 0) {
    result.value = "";
    updateStrength(0);
    return;
  }

  let password = "";

  for (const pool of pools) {
    password += getRandomChar(pool);
  }

  const allChars = pools.join("");

  while (password.length < length) {
    password += getRandomChar(allChars);
  }

  password = shuffleString(password).slice(0, length);

  result.value = password;

  const strength = calculateStrength(password, pools);
  updateStrength(strength);
}

function calculateStrength(password, pools) {
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 20;
  if (password.length >= 24) score += 10;

  score += pools.length * 10;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 5;
  if (/\d/.test(password)) score += 5;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;

  if (score > 100) score = 100;

  return score;
}

function updateStrength(strength) {
  strengthBar.style.width = `${strength}%`;

  if (strength === 0) {
    strengthLabel.textContent = "Başlangıç";
    strengthText.textContent = "0%";
    strengthHint.textContent = "Daha güçlü şifre için uzunluğu ve karakter çeşitliliğini artır.";
    strengthBar.style.background = "linear-gradient(90deg, #2f3136, #454b57)";
    return;
  }

  if (strength < 40) {
    strengthLabel.textContent = "Zayıf";
    strengthText.textContent = `${strength}%`;
    strengthHint.textContent = "Şifre zayıf. Uzunluğu artır ve daha fazla karakter türü seç.";
    strengthBar.style.background = "linear-gradient(90deg, #ff4d6d, #ff7b54)";
  } else if (strength < 70) {
    strengthLabel.textContent = "Orta";
    strengthText.textContent = `${strength}%`;
    strengthHint.textContent = "Fena değil. Biraz daha uzun yaparsan daha güvenli olur.";
    strengthBar.style.background = "linear-gradient(90deg, #ffd166, #ffb703)";
  } else {
    strengthLabel.textContent = "Güçlü";
    strengthText.textContent = `${strength}%`;
    strengthHint.textContent = "Gayet iyi. Bu şifre güçlü görünüyor.";
    strengthBar.style.background = "linear-gradient(90deg, #7ee787, #2dd4bf)";
  }
}

async function copyPassword() {
  const password = result.value.trim();

  if (!password) {
    const oldText = copyBtn.textContent;
    copyBtn.textContent = "Boş";
    setTimeout(() => {
      copyBtn.textContent = oldText;
    }, 1000);
    return;
  }

  try {
    await navigator.clipboard.writeText(password);

    const oldText = copyBtn.textContent;
    copyBtn.textContent = "Kopyalandı";
    setTimeout(() => {
      copyBtn.textContent = oldText;
    }, 1200);
  } catch (error) {
    const oldText = copyBtn.textContent;
    copyBtn.textContent = "Hata";
    setTimeout(() => {
      copyBtn.textContent = oldText;
    }, 1200);
    console.error("Kopyalama hatası:", error);
  }
}

function clearAll() {
  result.value = "";
  updateStrength(0);
}

function ensureAtLeastOneOption(event) {
  const selectedCount = [
    useLower.checked,
    useUpper.checked,
    useNumbers.checked,
    useSymbols.checked,
  ].filter(Boolean).length;

  if (selectedCount === 0) {
    event.target.checked = true;
  }
}

lengthInput.addEventListener("input", updateLengthUI);

[useLower, useUpper, useNumbers, useSymbols].forEach((checkbox) => {
  checkbox.addEventListener("change", ensureAtLeastOneOption);
});

generateBtn.addEventListener("click", generatePassword);
shuffleBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);
clearBtn.addEventListener("click", clearAll);

updateLengthUI();
updateStrength(0);