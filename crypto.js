// Convertit string en Uint8Array
function str2ab(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convertit Uint8Array en string
function ab2str(buf) {
  const decoder = new TextDecoder();
  return decoder.decode(buf);
}

// Convertit base64 en ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convertit ArrayBuffer en base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Hash SHA-256
async function sha256(message) {
  const data = str2ab(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return arrayBufferToBase64(hashBuffer);
}

// Génère une clé AES-GCM depuis un mot de passe
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Chiffre une string avec AES-GCM
async function encrypt(text, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encoded = str2ab(text);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoded);
  // concat salt + iv + encrypted
  const result = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.byteLength);
  result.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);
  return arrayBufferToBase64(result.buffer);
}

// Déchiffre une string chiffrée avec AES-GCM
async function decrypt(ciphertextBase64, password) {
  const data = base64ToArrayBuffer(ciphertextBase64);
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const encrypted = data.slice(28);
  const key = await deriveKey(password, salt);
  try {
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted);
    return ab2str(decrypted);
  } catch {
    throw new Error("Déchiffrement impossible (mauvais mot de passe ?)");
  }
}
