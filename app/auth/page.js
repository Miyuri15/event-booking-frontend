"use client";

import { useState } from "react";
import { loginUser, registerUser } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const initialRegisterState = {
  name: "",
  email: "",
  password: "",
};

const initialLoginState = {
  email: "",
  password: "",
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const handleRegister = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      await registerUser(registerForm);
      setRegisterForm(initialRegisterState);
      setMode("login");
      setStatus({
        loading: false,
        error: "",
        success: "Registration successful. You can log in now.",
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const data = await loginUser(loginForm);
      saveAuth(data);
      setLoginForm(initialLoginState);
      router.push("/dashboard");
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  };

  return (
    <main className="mx-auto grid min-h-screen w-[min(1160px,calc(100%-2rem))] grid-cols-[1.05fr_0.95fr] items-stretch gap-6 pt-8 pb-12 max-[900px]:grid-cols-1">
      <section className="flex items-stretch">
        <div className="flex min-h-full w-full flex-col justify-center rounded-[32px] bg-[linear-gradient(165deg,rgba(33,83,79,0.94),rgba(20,48,46,0.96)),linear-gradient(135deg,rgba(192,90,43,0.4),transparent)] p-12 text-[#f5efe4] shadow-[var(--shadow)] max-[900px]:p-8">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#f5efe4]">
            Event Booking Platform
          </p>
          <h1 className="mb-4 text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] text-[#f5efe4]">
            Sign in and start planning your next experience
          </h1>
          <p className="leading-[1.7] text-[#f5efe4]">
            Create an account to unlock event discovery, upcoming tickets, saved
            preferences, and your personal booking space.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.12)] px-4 py-3">
              Curated event discovery
            </div>
            <div className="rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.12)] px-4 py-3">
              Fast member login
            </div>
            <div className="rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.12)] px-4 py-3">
              Personal booking dashboard
            </div>
          </div>
        </div>
      </section>

      <section className="self-center rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] backdrop-blur-[14px] max-[900px]:p-[1.4rem]">
        <div className="mb-5 flex flex-wrap gap-3">
          <button
            className={
              mode === "login"
                ? "cursor-pointer rounded-full border-0 bg-[var(--surface-strong)] px-4 py-[0.8rem] text-[var(--text-main)] shadow-[inset_0_0_0_1px_var(--border)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                : "cursor-pointer rounded-full border-0 bg-transparent px-4 py-[0.8rem] text-[var(--text-muted)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
            }
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={
              mode === "register"
                ? "cursor-pointer rounded-full border-0 bg-[var(--surface-strong)] px-4 py-[0.8rem] text-[var(--text-main)] shadow-[inset_0_0_0_1px_var(--border)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
                : "cursor-pointer rounded-full border-0 bg-transparent px-4 py-[0.8rem] text-[var(--text-muted)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
            }
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

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

        {mode === "login" ? (
          <form className="grid gap-4" onSubmit={handleLogin}>
            <div>
              <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Sign In
              </p>
              <h2 className="mb-4 text-[1.7rem]">Access your account</h2>
            </div>

            <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
              <span>Email</span>
              <input
                className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="anuja@gmail.com"
                required
              />
            </label>

            <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
              <span>Password</span>
              <input
                className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Enter your password"
                required
              />
            </label>

            <button
              className="w-full cursor-pointer justify-center rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              disabled={status.loading}
              type="submit"
            >
              {status.loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={handleRegister}>
            <div>
              <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
                Create Account
              </p>
              <h2 className="mb-4 text-[1.7rem]">Create your member profile</h2>
            </div>

            <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
              <span>Full Name</span>
              <input
                className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                type="text"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Anuja Silva"
                required
              />
            </label>

            <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
              <span>Email</span>
              <input
                className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="anuja@gmail.com"
                required
              />
            </label>

            <label className="grid gap-2 text-[0.95rem] text-[var(--text-main)]">
              <span>Password</span>
              <input
                className="w-full rounded-2xl border border-[rgba(54,45,32,0.16)] bg-[rgba(255,255,255,0.75)] px-4 py-[0.95rem] outline-none focus:border-[rgba(192,90,43,0.45)] focus:shadow-[0_0_0_4px_rgba(192,90,43,0.12)]"
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <button
              className="w-full cursor-pointer justify-center rounded-full border-0 bg-[linear-gradient(135deg,var(--accent)_0%,#d7834d_100%)] px-[1.35rem] py-[0.95rem] text-white shadow-[0_12px_26px_rgba(192,90,43,0.28)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px"
              disabled={status.loading}
              type="submit"
            >
              {status.loading ? "Creating account..." : "Register"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
