const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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

function unwrapApiPayload(data) {
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
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

export function fetchAdminUsers(token) {
  return request(API_BASE_URL, "/api/users/admins", { token });
}

export function createAdminUser(payload, token) {
  return request(API_BASE_URL, "/api/users/admins", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateAdminUser(adminId, payload, token) {
  return request(API_BASE_URL, `/api/users/admins/${adminId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteAdminUser(adminId, token) {
  return request(API_BASE_URL, `/api/users/admins/${adminId}`, {
    method: "DELETE",
    token,
  });
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
  return request(API_BASE_URL, `/api/notifications/user/${userId}`, {
    token,
  });
}

export function markNotificationAsRead(notificationId, token) {
  return request(API_BASE_URL, `/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    token,
  });
}

// Public Events APIs (no authentication required)
export function fetchPublicEvents() {
  return request(API_BASE_URL, "/events/public", {}).then(unwrapApiPayload);
}

export function fetchPublicEventDetails(eventId) {
  return request(API_BASE_URL, `/events/${eventId}`, {}).then(unwrapApiPayload);
}

// Authenticated Events APIs
export function fetchUserEvents(token) {
  return request(API_BASE_URL, "/events", { token }).then(unwrapApiPayload);
}

export function createEvent(payload, token) {
  return request(API_BASE_URL, "/events", {
    method: "POST",
    body: payload,
    token,
  }).then(unwrapApiPayload);
}

export function bookEvent(eventId, payload, token) {
  return request(API_BASE_URL, `/events/${eventId}/book`, {
    method: "POST",
    body: payload,
    token,
  });
}
