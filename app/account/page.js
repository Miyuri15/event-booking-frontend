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
          <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
            <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
              Loading
            </p>
            <h3 className="mb-3 text-[1.05rem]">
              Fetching your account details...
            </h3>
          </section>
        ) : (
          <section className="grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
            <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
              <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Profile Settings
              </p>
              <h3 className="mb-3 text-[1.05rem]">
                Update your personal information
              </h3>

              {status.error ? (
                <p className="rounded-2xl border border-[rgba(182,61,61,0.18)] bg-[rgba(182,61,61,0.08)] px-4 py-[0.9rem] text-[var(--danger)]">
                  {status.error}
                </p>
              ) : null}
              {status.success ? (
                <p className="rounded-2xl border border-[rgba(47,125,83,0.18)] bg-[rgba(47,125,83,0.08)] px-4 py-[0.9rem] text-[var(--success)]">
                  {status.success}
                </p>
              ) : null}

              <form className="grid gap-4" onSubmit={handleSave}>
                <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
                  <span>Full Name</span>
                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
                  <span>Email</span>
                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
                  <span>New Password</span>
                  <input
                    className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
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

                <button
                  className="w-full cursor-pointer justify-center rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                  disabled={status.saving}
                  type="submit"
                >
                  {status.saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </article>

            <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
              <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Member Status
              </p>
              <h3 className="mb-3 text-[1.05rem]">Your account at a glance</h3>
              <div className="grid gap-4">
                <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                  <span>Email</span>
                  <strong>{profile?.email}</strong>
                </div>
                <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                  <span>Member Since</span>
                  <strong>
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </div>
                <div className="rounded-[20px] border border-[rgba(54,45,32,0.08)] bg-[rgba(255,255,255,0.6)] p-4">
                  <span>Account Status</span>
                  <strong>Active</strong>
                </div>
              </div>

              <div className="mt-6 border-t border-[rgba(54,45,32,0.12)] pt-5">
                <p className="mb-1 font-bold">Danger Zone</p>
                <p className="leading-[1.7] text-[var(--text-muted)]">
                  Remove this account and clear your access to the platform.
                </p>
                <button
                  className="mt-3 cursor-pointer rounded-full border-0 bg-[linear-gradient(135deg,#b63d3d_0%,#d45a5a_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(182,61,61,0.22)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
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
