import * as CryptoJS from "crypto-js";

const SECRET_KEY = CryptoJS.enc.Utf8.parse("3333e6e143439161");
const SECRET_IV = CryptoJS.enc.Utf8.parse("e3bbe7e3ba84431a");

/**
 * Encrypts the given data using AES encryption with the provided secret key and initialization vector.
 * If the data is an object, it will be converted to a JSON string before encryption.
 * @param data The data to encrypt.
 * @returns The encrypted ciphertext as a string.
 */
export function encrypt(data: unknown): string {
  let _data: string;
  if (typeof data === "object") {
    _data = JSON.stringify(data);
  } else {
    _data = data?.toString() ?? "";
  }
  const dataHex = CryptoJS.enc.Utf8.parse(_data as string);
  const encrypted = CryptoJS.AES.encrypt(dataHex, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  if (typeof data === "object") {
    return encrypted.ciphertext.toString() + "|" + _data;
  } else {
    return encrypted.ciphertext.toString();
  }
}

/**
 * Decrypts the given data using AES decryption with the provided secret key and initialization vector.
 * @param data The data to decrypt, in hexadecimal format.
 * @returns The decrypted plaintext as a string.
 */
export function decrypt(data: string | undefined): string {
  if (!data) {
    return "";
  }
  const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
  const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr;
}
