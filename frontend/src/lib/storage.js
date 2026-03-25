const isBrowser = typeof window !== "undefined";

export function readStorage(key) {
  if (!isBrowser) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeStorage(key, value) {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key) {
  if (!isBrowser) {
    return;
  }

  window.localStorage.removeItem(key);
}
