export const SESSION_KEY = "vainybliss_admin_session";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveAdminSession(user) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const payload = { user };
  storage.setItem(SESSION_KEY, JSON.stringify(payload));
}

export function loadAdminSession() {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    storage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearAdminSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(SESSION_KEY);
}
