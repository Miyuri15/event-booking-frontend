"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { fetchAdminBookings } from "@/lib/api";
import { getAuth, isAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEventName = (booking) => {
  return booking.eventName || "Unknown Event";
};

const getCustomerName = (booking) => {
  return booking.userName || booking.userId || "Unknown User";
};

const formatCurrency = (amount) => {
  return `LKR ${Number(amount || 0).toLocaleString()}`;
};

export default function AdminBookingsPage() {
  return (
    <AuthGuard>
      <AdminBookingsContent />
    </AuthGuard>
  );
}

function AdminBookingsContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    eventId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const router = useRouter();

  useEffect(() => {
    const authData = getAuth();
    setAuth(authData);

    if (authData && !isAdmin(authData)) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (!auth?.token) return;

    const loadBookings = async () => {
      setLoading(true);
      setError(""); // Clear previous errors

      try {
        const response = await fetchAdminBookings(auth.token, {
          ...filters,
          page: currentPage,
          limit: itemsPerPage,
        });

        // Handle response structure based on your actual API
        const data = response.data || [];
        const pagination = response.pagination || {};

        setBookings(data);
        setTotalPages(pagination.totalPages || 1);
        setTotalBookings(pagination.totalItems || 0);

        // If current page is greater than total pages after filter, reset to last page
        if (
          currentPage > (pagination.totalPages || 1) &&
          pagination.totalPages > 0
        ) {
          setCurrentPage(pagination.totalPages);
        }
      } catch (err) {
        console.error("Error loading bookings:", err);
        setError(err.message || "Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to avoid too many requests
    const timer = setTimeout(() => {
      loadBookings();
    }, 300);

    return () => clearTimeout(timer);
  }, [auth, filters, currentPage, itemsPerPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Smooth scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate displayed items range
  const startItem =
    totalBookings > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalBookings);

  // Get status badge color
  const getStatusBadgeClass = (status, paymentStatus) => {
    if (status === "CONFIRMED" || paymentStatus === "SUCCESS") {
      return "bg-green-100 text-green-800";
    } else if (status === "PENDING") {
      return "bg-yellow-100 text-yellow-800";
    } else if (status === "CANCELLED") {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <AppShell
      title="Manage Bookings"
      description="View and manage all customer reservations."
    >
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            All Bookings
          </h2>
          <div className="flex gap-2">
            <span className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-4 py-2 text-sm font-medium">
              Total: {totalBookings}
            </span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="Filter by User ID"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">
              Event ID
            </label>
            <input
              type="text"
              name="eventId"
              value={filters.eventId}
              onChange={handleFilterChange}
              placeholder="Filter by Event ID"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="createdAt">Created Date</option>
              <option value="eventDate">Event Date</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">
              Order
            </label>
            <select
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 w-full animate-pulse rounded-xl bg-[rgba(54,45,32,0.06)]"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
          <div className="mb-4 text-4xl">🎫</div>
          <h3 className="mb-2 text-lg font-bold">No bookings found</h3>
          <p className="text-[var(--text-muted)]">
            {filters.status || filters.userId || filters.eventId
              ? "Try adjusting your filters"
              : "Wait for customers to make reservations."}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-[14px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-[var(--border)] bg-[rgba(54,45,32,0.03)]">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      ID
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Event
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Customer
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Event Date
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Booked On
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Tickets
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Total
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-[rgba(54,45,32,0.02)] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-[var(--text-muted)]">
                        {booking.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--foreground)]">
                          {getEventName(booking)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {booking.venue}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[var(--foreground)]">
                          {getCustomerName(booking)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          ID: {booking.userId.substring(0, 8)}...
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-muted)]">
                        {formatDate(booking.eventDate)}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-muted)]">
                        {formatDate(booking.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-muted)]">
                        {booking.numberOfTickets}
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                        {formatCurrency(booking.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                              booking.status,
                              booking.paymentStatus,
                            )}`}
                          >
                            {booking.status}
                          </span>
                          {booking.paymentStatus &&
                            booking.paymentStatus !== "PENDING" && (
                              <div className="text-xs text-[var(--text-muted)]">
                                Payment: {booking.paymentStatus}
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-[var(--text-muted)]">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-[var(--text-muted)]">
                  entries
                </span>
              </div>

              <div className="text-sm text-[var(--text-muted)]">
                Showing {startItem} to {endItem} of {totalBookings} bookings
              </div>
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}

// Enhanced Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`rounded-lg px-3 py-2 text-sm transition-colors ${
            currentPage === page
              ? "bg-[var(--accent)] text-white"
              : page === "..."
                ? "cursor-default"
                : "border border-[var(--border)] hover:bg-[var(--surface)]"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
