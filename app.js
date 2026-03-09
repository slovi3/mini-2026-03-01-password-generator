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
    strengthText.textContent = "Seçim yap";
    return;
  }

  let password = "";

  // Her seçili gruptan en az 1 karakter ekle
  for (const pool of pools) {
    password += getRandomChar(pool);
  }

  // Tüm havuzları birleştir
  const allChars = pools.join("");

  // Kalan karakterleri doldur
  while (password.length < length) {
    password += getRandomChar(allChars);
  }

  // Karakter sırasını karıştır
  password = shuffleString(password);

  result.value = password;
  updateStrength(calculateStrength(password, pools));
}

function calculateStrength(password, pools) {
  let score = 0;

  // Uzunluk puanı
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 20;
  if (password.length >= 24) score += 10;

  // Karakter çeşitliliği puanı
  score += pools.length * 10;

  // Bonus kontrol
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 5;
  if (/\d/.test(password)) score += 5;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;

  if (score > 100) score = 100;

  return score;
}

function updateStrength(strength) {
  strengthBar.style.width = `${strength}%`;

  if (strength === 0) {
    strengthText.textContent = "0%";
    strengthBar.style.filter = "none";
    return;
  }

  if (strength < 40) {
    strengthText.textContent = `Zayıf ${strength}%`;
    strengthBar.style.filter = "none";
  } else if (strength < 70) {
    strengthText.textContent = `Orta ${strength}%`;
    strengthBar.style.filter = "brightness(1.02)";
  } else {
    strengthText.textContent = `Güçlü ${strength}%`;
    strengthBar.style.filter = "brightness(1.08)";
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
  strengthText.textContent = "0%";
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

// İlk yükleme
updateLengthUI();
updateStrength(0);
strengthText.textContent = "0%";