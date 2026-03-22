const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||"https://api-gateway-b7d9e6duc3c0aefx.southeastasia-01.azurewebsites.net" || "http://localhost:8086";

async function request(baseUrl, path, options = {}) {
  // Clean the token - remove any existing "Bearer " prefix
  const token = options.token ? options.token.replace("Bearer ", "") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${path}`, {
    headers,
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

// Auth & User APIs (keep your existing ones)
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

// Notification APIs
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

export function markAllNotificationsAsRead(userId, token) {
  return request(API_BASE_URL, `/api/notifications/user/${userId}/read-all`, {
    method: "PATCH",
    token,
  });
}

// EVENT APIs
export function fetchPublicEvents(params = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const queryString = queryParams.toString();
  const endpoint = `/api/events${queryString ? `?${queryString}` : ""}`;
  return request(API_BASE_URL, endpoint, {}).then(unwrapApiPayload);
}

export function fetchPublicEventDetails(eventId) {
  return request(API_BASE_URL, `/api/events/${eventId}`, {}).then(
    unwrapApiPayload,
  );
}

export function fetchEvents(params = {}, token) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const queryString = queryParams.toString();
  const endpoint = `/api/events${queryString ? `?${queryString}` : ""}`;
  return request(API_BASE_URL, endpoint, { token });
}

export function fetchEventById(eventId, token) {
  return request(API_BASE_URL, `/api/events/${eventId}`, { token }).then(
    unwrapApiPayload,
  );
}

export function fetchOrganizerEvents(organizerId, token) {
  return request(API_BASE_URL, `/api/events/organizer/${organizerId}`, {
    token,
  }).then(unwrapApiPayload);
}

// FIXED: Create new event with proper token handling
export function createEvent(eventData, token) {
  // Clean the token - remove any existing "Bearer " prefix
  const cleanToken = token ? token.replace("Bearer ", "") : "";

  // If there's a file to upload, we need to use FormData
  if (eventData.images && eventData.images instanceof File) {
    const formData = new FormData();

    // Append all fields to FormData
    Object.entries(eventData).forEach(([key, value]) => {
      if (key === "images" && value instanceof File) {
        formData.append("images", value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Log for debugging
    console.log(
      "Creating event with token:",
      cleanToken.substring(0, 20) + "...",
    );

    return fetch(`${API_BASE_URL}/api/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        // Do NOT set Content-Type header - browser will set it with boundary
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      console.log("Create event response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create event");
      }
      return unwrapApiPayload(data);
    });
  }

  // If no file, use regular JSON request
  return request(API_BASE_URL, "/api/events", {
    method: "POST",
    body: eventData,
    token: cleanToken,
  }).then(unwrapApiPayload);
}

// Update event (with image upload support)
export function updateEvent(eventId, eventData, token) {
  const cleanToken = token ? token.replace("Bearer ", "") : "";

  if (eventData.images && eventData.images instanceof File) {
    const formData = new FormData();

    Object.entries(eventData).forEach(([key, value]) => {
      if (key === "images" && value instanceof File) {
        formData.append("images", value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return fetch(`${API_BASE_URL}/api/events/${eventId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update event");
      }
      return unwrapApiPayload(data);
    });
  }

  return request(API_BASE_URL, `/api/events/${eventId}`, {
    method: "PUT",
    body: eventData,
    token: cleanToken,
  }).then(unwrapApiPayload);
}

export function deleteEvent(eventId, token) {
  const cleanToken = token ? token.replace("Bearer ", "") : "";
  return request(API_BASE_URL, `/api/events/${eventId}`, {
    method: "DELETE",
    token: cleanToken,
  }).then(unwrapApiPayload);
}

export function updateEventSeats(eventId, quantity, operation, token) {
  const cleanToken = token ? token.replace("Bearer ", "") : "";
  return request(API_BASE_URL, `/api/events/${eventId}/seats`, {
    method: "PUT",
    body: { quantity, operation },
    token: cleanToken,
  }).then(unwrapApiPayload);
}

export function bookEvent(eventId, payload, token) {
  const cleanToken = token ? token.replace("Bearer ", "") : "";
  return request(API_BASE_URL, `/api/bookings`, {
    method: "POST",
    body: { ...payload, eventId },
    token: cleanToken,
  }).then(unwrapApiPayload);
}

export function fetchMyBookings(token, params = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const queryString = queryParams.toString();
  return request(
    API_BASE_URL,
    `/api/bookings/user/me${queryString ? `?${queryString}` : ""}`,
    { token },
  );
}

export function cancelBooking(bookingId, token) {
  return request(API_BASE_URL, `/api/bookings/${bookingId}`, {
    method: "DELETE",
    token,
  }).then(unwrapApiPayload);
}

export const fetchAdminBookings = async (token, filters = {}) => {
  const {
    status = "",
    userName = "",
    eventId = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;

  // Build query parameters
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (userName) params.append("userName", userName);
  if (eventId) params.append("eventId", eventId);
  params.append("sortBy", sortBy);
  params.append("sortOrder", sortOrder);
  params.append("page", page);
  params.append("limit", limit);

  const queryString = params.toString();

  return request(
    API_BASE_URL,
    `/api/bookings${queryString ? `?${queryString}` : ""}`,
    { token },
  );
};

export function fetchEventsForBookingPage(token) {
  return request(API_BASE_URL, "/api/events", { token });
}

export function fetchUserEvents(token) {
  return fetchEvents({ status: "Active" }, token);
}

export function createStripeCheckoutSession(items, token, bookingId) {
  return request(API_BASE_URL, "/api/payment/create-checkout-session", {
    method: "POST",
    body: {
      products: items,
      bookingId: bookingId,
    },
    token,
  });
}

export function fetchPendingBookings(userId, token) {
  return request(API_BASE_URL, `/api/bookings/user/${userId}?status=PENDING`, {
    method: "GET",
    token,
  });
}

export function fetchBookingById(bookingId, token) {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }
  return request(API_BASE_URL, `/api/bookings/${bookingId}`, { token }).then(
    unwrapApiPayload,
  );
}

// Fetch recent payment records through the gateway by default.
export function fetchRecentPayments(token) {
  const paymentBase = process.env.NEXT_PUBLIC_PAYMENT_API_URL || API_BASE_URL;
  return request(paymentBase, "/api/payment/recent", { token });
}
