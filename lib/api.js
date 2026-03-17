const API_BASE_URL = process.env.NEXT_BACKEND_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  return request("/api/users/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload) {
  return request("/api/users/login", {
    method: "POST",
    body: payload,
  });
}

export function fetchMyProfile(token) {
  return request("/api/users/me", { token });
}

export function fetchUserBookings(userId, token) {
  return request(`/api/users/${userId}/bookings`, { token });
}

export function updateUserProfile(userId, payload, token) {
  return request(`/api/users/${userId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteUserProfile(userId, token) {
  return request(`/api/users/${userId}`, {
    method: "DELETE",
    token,
  });
}
