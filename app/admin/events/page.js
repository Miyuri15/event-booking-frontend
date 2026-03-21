"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchEventById,
} from "@/lib/api";
import { getAuth, isAdmin } from "@/lib/auth";
import Link from "next/link";

function formatPrice(value) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function formatEventDate(value) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventForm({ event, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    venue: "",
    date: "",
    totalSeats: "",
    ticketPrice: "",
    category: "Other",
    status: "Active",
    images: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        venue: event.venue || "",
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
        totalSeats: event.totalSeats || "",
        ticketPrice: event.ticketPrice || "",
        category: event.category || "Other",
        status: event.status || "Active",
        images: null,
      });
      if (event.images?.[0]?.url) {
        setImagePreview(event.images[0].url);
      }
    }
  }, [event]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, images: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Event name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.venue.trim()) newErrors.venue = "Venue is required";
    if (!formData.date) {
      newErrors.date = "Event date is required";
    } else if (new Date(formData.date) <= new Date()) {
      newErrors.date = "Event date must be in the future";
    }
    if (!formData.totalSeats || formData.totalSeats < 1) {
      newErrors.totalSeats = "Total seats must be at least 1";
    }
    if (!formData.ticketPrice || formData.ticketPrice < 0) {
      newErrors.ticketPrice = "Ticket price cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      totalSeats: Number(formData.totalSeats),
      ticketPrice: Number(formData.ticketPrice),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
          Event Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full rounded-xl border ${errors.name ? "border-red-500" : "border-[rgba(54,45,32,0.16)]"} px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
          placeholder="Enter event name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows="4"
          className={`w-full rounded-xl border ${errors.description ? "border-red-500" : "border-[rgba(54,45,32,0.16)]"} px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
          placeholder="Describe the event"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
            Venue *
          </label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) =>
              setFormData({ ...formData, venue: e.target.value })
            }
            className={`w-full rounded-xl border ${errors.venue ? "border-red-500" : "border-[rgba(54,45,32,0.16)]"} px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
            placeholder="Event venue"
          />
          {errors.venue && (
            <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
            Event Date & Time *
          </label>
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`w-full rounded-xl border ${errors.date ? "border-red-500" : "border-[rgba(54,45,32,0.16)]"} px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="Concert">Concert</option>
            <option value="Conference">Conference</option>
            <option value="Sports">Sports</option>
            <option value="Theater">Theater</option>
            <option value="Workshop">Workshop</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
            Total Seats *
          </label>
          <input
            type="number"
            min="1"
            value={formData.totalSeats}
            onChange={(e) =>
              setFormData({ ...formData, totalSeats: e.target.value })
            }
            className={`w-full rounded-xl border ${errors.totalSeats ? "border-red-500" : "border-[rgba(54,45,32,0.16)]"} px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
            placeholder="Number of seats"
          />
          {errors.totalSeats && (
            <p className="text-red-500 text-sm mt-1">{errors.totalSeats}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
            Ticket Price (LKR) *
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={formData.ticketPrice}
            onChange={(e) =>
              setFormData({ ...formData, ticketPrice: e.target.value })
            }
            className={`w-full rounded-xl border ${errors.ticketPrice ? "border-red-500" : "border-[rgba(54,45,32,0.16)]"} px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
            placeholder="Ticket price"
          />
          {errors.ticketPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.ticketPrice}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-[var(--text-main)]">
          Event Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-xl border border-[rgba(54,45,32,0.16)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        {imagePreview && (
          <div className="mt-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#d7834d] px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EventCard({ event, onEdit, onDelete }) {
  const eventImage = event.images?.[0]?.url || "/placeholder-event.jpg";
  const seatsPercentage = (event.availableSeats / event.totalSeats) * 100;

  return (
    <article className="group rounded-2xl border border-[rgba(54,45,32,0.08)] bg-white overflow-hidden shadow-md transition-all hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        <img
          src={eventImage}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/placeholder-event.jpg";
          }}
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              event.status === "Active"
                ? "bg-green-500 text-white"
                : event.status === "Completed"
                  ? "bg-gray-500 text-white"
                  : "bg-red-500 text-white"
            }`}
          >
            {event.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2">
          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[var(--accent-dark)]">
            {event.category}
          </span>
        </div>

        <h4 className="mb-2 text-lg font-bold line-clamp-1">{event.name}</h4>
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <span className="truncate">{event.venue}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatEventDate(event.date)}</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>
                Seats: {event.availableSeats}/{event.totalSeats}
              </span>
              <span>{Math.round(seatsPercentage)}% remaining</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[var(--accent)] to-orange-400 h-2 rounded-full"
                style={{ width: `${seatsPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-[var(--accent)]">
              {formatPrice(event.ticketPrice)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 rounded-full bg-blue-500 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-600 transition-all"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(event._id)}
            className="flex-1 rounded-full bg-red-500 text-white px-4 py-2 text-sm font-semibold hover:bg-red-600 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [eventPendingDelete, setEventPendingDelete] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Get unique categories from events for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    events.forEach((event) => {
      if (event.category) {
        uniqueCategories.add(event.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [events]);

  useEffect(() => {
    const authData = getAuth();
    setAuth(authData);

    if (!isAdmin(authData)) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (auth?.token && isAdmin(auth)) {
      loadEvents();
    }
  }, [auth, currentPage, filterStatus, filterCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
      };
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;

      const response = await fetchEvents(params, auth.token);
      const eventsData = response?.data || response || [];
      const pagination = response?.pagination;

      setEvents(eventsData);
      if (pagination) {
        setTotalPages(pagination.pages || 1);
        setTotalEvents(pagination.total || 0);
        setItemsPerPage(pagination.limit || 12);
      }
      setStatus({ error: "", success: "" });
    } catch (error) {
      setStatus({ error: "Failed to load events", success: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    setFormLoading(true);
    try {
      const newEvent = await createEvent(eventData, auth.token);
      setEvents([newEvent, ...events]);
      setShowForm(false);
      setStatus({ error: "", success: "Event created successfully!" });
      setTimeout(() => setStatus({ error: "", success: "" }), 3000);
      loadEvents();
    } catch (error) {
      setStatus({
        error: error.message || "Failed to create event",
        success: "",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEvent = async (eventData) => {
    setFormLoading(true);
    try {
      const updatedEvent = await updateEvent(
        editingEvent._id,
        eventData,
        auth.token,
      );
      setEvents(
        events.map((e) => (e._id === updatedEvent._id ? updatedEvent : e)),
      );
      setEditingEvent(null);
      setShowForm(false);
      setStatus({ error: "", success: "Event updated successfully!" });
      setTimeout(() => setStatus({ error: "", success: "" }), 3000);
      loadEvents();
    } catch (error) {
      setStatus({
        error: error.message || "Failed to update event",
        success: "",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventPendingDelete) return;

    setIsDeletingEvent(true);
    try {
      await deleteEvent(eventPendingDelete._id, auth.token);
      setEvents(events.filter((e) => e._id !== eventPendingDelete._id));
      setStatus({ error: "", success: "Event deleted successfully!" });
      setTimeout(() => setStatus({ error: "", success: "" }), 3000);
      setEventPendingDelete(null);
      loadEvents();
    } catch (error) {
      setStatus({
        error: error.message || "Failed to delete event",
        success: "",
      });
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setCurrentPage(1);
  };

  if (!auth || !isAdmin(auth)) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalEvents);

  return (
    <AuthGuard>
      <AppShell
        title="Admin Events Management"
        description="Create, edit, and manage all events from a single dashboard. Control event details, availability, and status."
      >
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <EventForm
                event={editingEvent}
                onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
                onCancel={handleCloseForm}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={Boolean(eventPendingDelete)}
          title="Delete this event?"
          description={
            eventPendingDelete
              ? `Are you sure you want to delete "${eventPendingDelete.name}"? This action cannot be undone.`
              : ""
          }
          confirmLabel="Delete Event"
          cancelLabel="Keep Event"
          isDanger
          isLoading={isDeletingEvent}
          onConfirm={handleDeleteEvent}
          onCancel={() => {
            if (!isDeletingEvent) {
              setEventPendingDelete(null);
            }
          }}
        />

        {/* Status Messages */}
        {status.error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-red-700">⚠️ {status.error}</p>
          </div>
        )}
        {status.success && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4">
            <p className="text-green-700">✓ {status.success}</p>
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 flex-wrap">
              {/* Status Filters */}
              <button
                onClick={() => setFilterStatus("")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterStatus === ""
                    ? "bg-[var(--accent)] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilterStatus("Active")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterStatus === "Active"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("Completed")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterStatus === "Completed"
                    ? "bg-gray-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus("Cancelled")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterStatus === "Cancelled"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancelled
              </button>

              {/* Category Filter Dropdown */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Clear Filters Button */}
              {(filterStatus || filterCategory) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                >
                  Clear Filters ✕
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[#d7834d] px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              + Create New Event
            </button>
          </div>

          {/* Active Filters Display */}
          {(filterStatus || filterCategory) && (
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="text-[var(--text-muted)]">Active filters:</span>
              {filterStatus && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                  Status: {filterStatus}
                </span>
              )}
              {filterCategory && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                  Category: {filterCategory}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent)] border-t-transparent"></div>
              <p className="mt-4 text-[var(--text-muted)]">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--border)] bg-gray-50">
            <div className="text-6xl mb-4">🎪</div>
            <p className="text-lg text-[var(--text-muted)]">No events found</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              {filterStatus || filterCategory
                ? "Try clearing your filters to see more events"
                : "Click 'Create New Event' to get started"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEdit}
                  onDelete={() => setEventPendingDelete(event)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-50 transition-all"
                  >
                    ← Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            currentPage === page
                              ? "bg-[var(--accent)] text-white shadow-md"
                              : "border border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-50 transition-all"
                  >
                    Next →
                  </button>
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-[var(--text-muted)]">
                    Showing {startItem} - {endItem} of {totalEvents} events
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </AppShell>
    </AuthGuard>
  );
}
