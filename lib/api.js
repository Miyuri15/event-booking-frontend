const API_BASE_URL = process.env.NEXT_BACKEND_URL || "http://localhost:8080";
const NOTIFICATION_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:8085";

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token
        ? {
            Authorization: `Bearer ${options.token}`,
          }
        : {}),
      ...options.headers,
    },
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export function registerUser(payload) {
  return request(API_BASE_URL, "/api/users/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload) {
  return request(API_BASE_URL, "/api/users/login", {
    method: "POST",
    body: payload,
  });
}

export function fetchMyProfile(token) {
  return request(API_BASE_URL, "/api/users/me", { token });
}

export function fetchUserBookings(userId, token) {
  return request(API_BASE_URL, `/api/users/${userId}/bookings`, { token });
}

export function updateUserProfile(userId, payload, token) {
  return request(API_BASE_URL, `/api/users/${userId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteUserProfile(userId, token) {
  return request(API_BASE_URL, `/api/users/${userId}`, {
    method: "DELETE",
    token,
  });
}

export function fetchUserNotifications(userId, token) {
  return request(
    NOTIFICATION_API_BASE_URL,
    `/api/notifications/user/${userId}`,
    {
      token,
    },
  );
}

export function markNotificationAsRead(notificationId, token) {
  return request(
    NOTIFICATION_API_BASE_URL,
    `/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      token,
    },
  );
}
