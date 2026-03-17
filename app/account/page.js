"use client";

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import ConfirmationModal from "@/components/ConfirmationModal";
import { clearAuth, getAuth } from "@/lib/auth";
import {
  deleteUserProfile,
  fetchMyProfile,
  updateUserProfile,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({
    loading: true,
    saving: false,
    deleting: false,
    error: "",
    success: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchMyProfile(auth.token);
        setProfile(data);
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          password: "",
        });
        setStatus((current) => ({ ...current, loading: false }));
      } catch (error) {
        setStatus((current) => ({
          ...current,
          loading: false,
          error: error.message,
        }));
      }
    };

    loadProfile();
  }, [auth]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!profile?._id || !auth?.token) {
      return;
    }

    setStatus((current) => ({
      ...current,
      saving: true,
      error: "",
      success: "",
    }));

    const payload = {
      name: form.name,
      email: form.email,
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      const updated = await updateUserProfile(profile._id, payload, auth.token);
      setProfile(updated);
      setForm((current) => ({
        ...current,
        name: updated.name,
        email: updated.email,
        password: "",
      }));

      const nextAuth = {
        ...auth,
        user: {
          ...auth.user,
          id: updated._id,
          name: updated.name,
          email: updated.email,
        },
      };

      localStorage.setItem("event-booking-auth", JSON.stringify(nextAuth));
      setAuth(nextAuth);

      setStatus((current) => ({
        ...current,
        saving: false,
        success: "Account updated successfully.",
      }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        saving: false,
        error: error.message,
      }));
    }
  };

  const handleDelete = async () => {
    if (!profile?._id || !auth?.token) {
      return;
    }

    setStatus((current) => ({
      ...current,
      deleting: true,
      error: "",
      success: "",
    }));

    try {
      await deleteUserProfile(profile._id, auth.token);
      setShowDeleteModal(false);
      clearAuth();
      router.push("/auth");
    } catch (error) {
      setStatus((current) => ({
        ...current,
        deleting: false,
        error: error.message,
      }));
    }
  };

  return (
    <AuthGuard>
      <AppShell
        title="Account"
        description="Manage your member profile, keep your details current, and control the account linked to your bookings."
      >
        {status.loading ? (
          <section className="panel">
            <p className="eyebrow">Loading</p>
            <h3>Fetching your account details...</h3>
          </section>
        ) : (
          <section className="workspace-grid">
            <article className="panel">
              <p className="eyebrow">Profile Settings</p>
              <h3>Update your personal information</h3>

              {status.error ? <p className="status error">{status.error}</p> : null}
              {status.success ? <p className="status success">{status.success}</p> : null}

              <form className="form-grid" onSubmit={handleSave}>
                <label>
                  Full Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  New Password
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Leave blank to keep your current password"
                  />
                </label>

                <button className="primary-button wide-button" disabled={status.saving} type="submit">
                  {status.saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </article>

            <article className="panel">
              <p className="eyebrow">Member Status</p>
              <h3>Your account at a glance</h3>
              <div className="account-summary">
                <div className="summary-card">
                  <span>Email</span>
                  <strong>{profile?.email}</strong>
                </div>
                <div className="summary-card">
                  <span>Member Since</span>
                  <strong>
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </div>
                <div className="summary-card">
                  <span>Account Status</span>
                  <strong>Active</strong>
                </div>
              </div>

              <div className="danger-zone">
                <p className="danger-title">Danger Zone</p>
                <p className="empty-state">
                  Remove this account and clear your access to the platform.
                </p>
                <button
                  className="danger-button"
                  disabled={status.deleting}
                  onClick={() => setShowDeleteModal(true)}
                  type="button"
                >
                  {status.deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </article>
          </section>
        )}
        <ConfirmationModal
          cancelLabel="Keep Account"
          confirmLabel="Delete Account"
          description="This will permanently remove this profile from the platform. You will need to register again to use this account."
          isDanger
          isLoading={status.deleting}
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete your account?"
        />
      </AppShell>
    </AuthGuard>
  );
}
