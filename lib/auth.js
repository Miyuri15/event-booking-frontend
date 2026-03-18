// lib/auth.js
const AUTH_STORAGE_KEY = "event-booking-auth";

function normalizeAuth(data) {
  if (!data) {
    return null;
  }

  // Ensure token doesn't have "Bearer " prefix when stored
  const cleanToken = data.token ? data.token.replace("Bearer ", "") : null;

  return {
    token: cleanToken,
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

  const normalized = normalizeAuth(data);
  console.log("Saving auth data:", {
    hasToken: !!normalized.token,
    tokenStart: normalized.token
      ? normalized.token.substring(0, 20) + "..."
      : null,
    user: normalized.user,
  });

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
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
    const parsed = JSON.parse(raw);
    const normalized = normalizeAuth(parsed);

    console.log("Retrieved auth data:", {
      hasToken: !!normalized.token,
      tokenStart: normalized.token
        ? normalized.token.substring(0, 20) + "..."
        : null,
    });

    return normalized;
  } catch (error) {
    console.error("Error parsing auth:", error);
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
