const AUTH_STORAGE_KEY = "event-booking-auth";

function normalizeAuth(data) {
  if (!data) {
    return null;
  }

  return {
    token: data.token,
    user: data.user
      ? {
          ...data.user,
          role: data.user.role || "USER",
        }
      : null,
  };
}

export function saveAuth(data) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizeAuth(data)));
}

export function getAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeAuth(JSON.parse(raw));
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getUserRole(auth) {
  return auth?.user?.role || "USER";
}

export function isAdmin(auth) {
  return getUserRole(auth) === "ADMIN";
}
