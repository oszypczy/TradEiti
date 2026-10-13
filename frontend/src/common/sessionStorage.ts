export function saveInSessionStorage(key: string, value: string) {
  sessionStorage.setItem(key, value);
}

export function getFromSessionStorage(key: string) {
  return sessionStorage.getItem(key);
}

// Parses a JSON value from session storage; returns undefined when the key is
// missing or holds invalid JSON.
export function getJsonFromSessionStorage<T>(key: string): T | undefined {
  const value = getFromSessionStorage(key);
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function getMultipleValuesFromSessionStorage(keys: string[]) {
  const values: Record<string, unknown> = {};
  keys.forEach((key) => {
    values[key] = getJsonFromSessionStorage(key) ?? "";
  });
  return values;
}

export function removeFromSessionStorage(key: string) {
  sessionStorage.removeItem(key);
}

export function removeMultipleValuesFromSessionStorage(keys: string[]) {
  keys.forEach((key) => {
    removeFromSessionStorage(key);
  });
}

export function clearSessionStorage() {
  sessionStorage.clear();
}
