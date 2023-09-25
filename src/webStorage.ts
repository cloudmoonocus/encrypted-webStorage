import { decrypt, encrypt } from "./crypto";

interface IConfig {
  type: "localStorage" | "sessionStorage";
  prefix: string;
  expire: number;
  isEncrypt: boolean;
}

interface StorageMap {
  key: string | null;
  value: string | null;
}

const config: IConfig = {
  type: "localStorage",
  prefix: "ENCRYPTED",
  expire: 7 * 24 * 60 * 60,
  isEncrypt: true,
};

/**
 * Determine whether Storage is supported by the browser
 * @returns {boolean}
 */
export function isSupportStorage(): boolean {
  return typeof Storage !== "undefined" ? true : false;
}

function autoAddPrefix(key: string, prefix?: string): string {
  return (prefix ? prefix + "_" : "") + key;
}

function autoRemovePrefix(key: string, prefix?: string): string {
  const len = prefix ? prefix.length + 1 : 0;
  return key.substring(len);
}

/**
 * Set Storage
 * @param {string} key
 * @param {unknown} value
 * @param {Object} options
 * @param {string} options.type - "localStorage(Default)", "sessionStorage"
 * @param {string} options.prefix - prefix
 * @param {number} options.expire - expire time (unit: second)
 */
export function setStorage(key: string, value: unknown, options?: { type?: string; prefix?: string; expire?: number }) {
  const _options = { ...config, ...options };
  const { expire } = _options;
  const _value = value === "" || value === null || value === undefined ? null : value;
  const _expire =
    isNaN(expire) || expire < 0
      ? (() => {
          throw new Error(`Expire must be a number`);
        })()
      : expire * 1000;
  const data = {
    value: _value,
    time: Date.now(),
    expire: _expire,
  };
  const encryptString = _options.isEncrypt ? encrypt(JSON.stringify(data)) : JSON.stringify(data);
  window[_options.type].setItem(autoAddPrefix(key, _options.prefix), encryptString);
}

/**
 * Delete the specified Storage
 * @param {string} key
 * @param {Object} options
 * @param {string} options.prefix - prefix
 * @param {string} options.type - "localStorage(Default)", "sessionStorage"
 */
export function removeStorage(
  key: string,
  { prefix = config.prefix, type = config.type }: { prefix?: string; type?: "localStorage" | "sessionStorage" }
) {
  window[type].removeItem(autoAddPrefix(key, prefix));
}

/**
 * Get the specified Storage
 * @param {string} key
 * @param {Object} options
 * @param {string} options.prefix - prefix
 * @param {string} options.type - "localStorage(Default)", "sessionStorage"
 * @returns {unknown}
 */
export function getStorage(
  key: string,
  { prefix = config.prefix, type = config.type }: { prefix?: string; type?: "localStorage" | "sessionStorage" }
): unknown {
  const _key = autoAddPrefix(key, prefix);

  if (!window[type].getItem(_key) || JSON.stringify(window[type].getItem(_key)) === "null") {
    return null;
  }

  const storage = config.isEncrypt
    ? JSON.parse(decrypt(window[type].getItem(_key) ?? "{}"))
    : JSON.parse(window[type].getItem(_key) ?? "{}");

  const nowTime = Date.now();
  if (storage.expire && config.expire * 6000 < nowTime - storage.time) {
    removeStorage(_key, { prefix, type });
    return null;
  } else {
    setStorage(autoRemovePrefix(_key, prefix), storage.value, { type, prefix });
    return storage.value;
  }
}

/**
 * Get all Storage
 * @param {string} type - "localStorage(Default)", "sessionStorage"
 * @returns {StorageMap[]}
 */
export function getStorageAll(type: "localStorage" | "sessionStorage" = config.type): StorageMap[] {
  const length = window[type].length;
  const array: StorageMap[] = [];
  for (let i = 0; i < length; i++) {
    const getKey = window[type].key(i);
    const getVal = window[type].getItem(getKey ?? "");
    array[i] = { key: getKey, value: getVal };
  }
  return array;
}

/**
 * Does Storage exist?
 * @param {string} key - key name
 * @param {string} prefix - prefix
 * @returns {boolean}
 */
export function hasStorage(key: string, prefix?: string): boolean {
  const arr = getStorageAll().filter((item) => {
    return item.key === autoAddPrefix(key, prefix);
  });
  return arr.length ? true : false;
}

/**
 * Get all key names
 * @returns {string[]}
 */
export function getStorageKeys(): string[] {
  const items = getStorageAll();
  const keys: string[] = [];
  for (let index = 0; index < items.length; index++) {
    if (!items[index].key) continue;
    keys.push(items[index].key as string);
  }
  return keys;
}

/**
 * Get key name based on index
 * @param {number} index
 * @param {string} type - "localStorage(Default)", "sessionStorage"
 * @returns {string | null}
 */
export function getStorageForIndex(
  index: number,
  type: "localStorage" | "sessionStorage" = config.type
): string | null {
  return window[type].key(index);
}

/**
 * Get Storage length
 * @param {string} type - "localStorage(Default)", "sessionStorage"
 * @returns {number}
 */
export function getStorageLength(type: "localStorage" | "sessionStorage" = config.type): number {
  return window[type].length;
}

/**
 * Clear Storage
 * @param {string} type - "localStorage(Default)", "sessionStorage"
 */
export function clearStorage(type: "localStorage" | "sessionStorage" = config.type) {
  window[type].clear();
}
