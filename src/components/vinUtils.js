// ---------------------------
// VIN validation tables
// ---------------------------

export const VIN_MAP = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
};

export const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

// ---------------------------
// Confusiones comunes scanner
// ---------------------------

export const COMMON_CONFUSIONS = {
  O: ["0"],
  0: ["O"],
  I: ["1"],
  1: ["I"],
  S: ["5"],
  5: ["S"],
  B: ["8"],
  8: ["B"],
  Z: ["2"],
  2: ["Z"],
  G: ["6"],
  6: ["G"],
};

// ---------------------------
// Excepciones OEM
// ---------------------------

export const CHECK_DIGIT_EXCEPTIONS = {
  "9BD": ["2", "N", "4", "K", "S", "U", "B", "F", "1", "3"], // Fiat Brasil
  "93H": ["0"], // Honda Brasil
  "9BG": ["0"], // GM Brasil
  "93Z": [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "N",
    "Z",
    "X",
    "K",
    "F",
  ],
};

// ---------------------------
// Normalizar ingreso VIN
// ---------------------------

export const normalizeVinChar = (char, current) => {
  const c = char.toUpperCase();

  // bloquear caracteres no permitidos
  if (c === "I" || c === "O" || c === "Q") return current;

  // máximo 17
  if (current.length >= 17) return current;

  return current + c;
};

// ---------------------------
// Validación completa VIN
// ---------------------------

export function isValidVIN(vin) {
  if (!vin || vin.length !== 17) return false;

  if (/[IOQ]/.test(vin)) return false;

  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return false;

  const wmi = vin.slice(0, 3);

  let sum = 0;

  for (let i = 0; i < 17; i++) {
    sum += VIN_MAP[vin[i]] * VIN_WEIGHTS[i];
  }

  const check = sum % 11;

  const checkChar = check === 10 ? "X" : String(check);

  // validación ISO
  if (vin[8] === checkChar) return true;

  // excepción fabricante
  if (
    CHECK_DIGIT_EXCEPTIONS[wmi] &&
    CHECK_DIGIT_EXCEPTIONS[wmi].includes(vin[8])
  ) {
    return true;
  }

  return false;
}

// ---------------------------
// Validación simple
// ---------------------------

export function isValidVINSoft(vin) {
  return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

// ---------------------------
// Autocorrección VIN OEM
// ---------------------------

export function attemptVinAutoFixOEM(vin) {
  if (!vin || vin.length !== 17) return null;

  if (isValidVIN(vin)) return vin;

  for (let i = 0; i < 17; i++) {
    // nunca tocar dígito verificador
    if (i === 8) continue;

    const originalChar = vin[i];

    const replacements = COMMON_CONFUSIONS[originalChar];

    if (!replacements) continue;

    for (let replacement of replacements) {
      const candidate = vin.slice(0, i) + replacement + vin.slice(i + 1);

      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(candidate)) continue;

      if (isValidVIN(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}
