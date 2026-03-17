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
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

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
    <main className="auth-shell">
      <section className="auth-showcase">
        <div className="auth-showcase-card">
          <p className="eyebrow">Event Booking Platform</p>
          <h1>Sign in and start planning your next experience</h1>
          <p className="section-copy">
            Create an account to unlock event discovery, upcoming tickets, saved
            preferences, and your personal booking space.
          </p>

          <div className="auth-feature-list">
            <div className="feature-chip">Curated event discovery</div>
            <div className="feature-chip">Fast member login</div>
            <div className="feature-chip">Personal booking dashboard</div>
          </div>
        </div>
      </section>

      <section className="panel auth-panel">
        <div className="tab-row">
          <button
            className={mode === "login" ? "tab active-tab" : "tab"}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "tab active-tab" : "tab"}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        {status.error ? <p className="status error">{status.error}</p> : null}
        {status.success ? <p className="status success">{status.success}</p> : null}

        {mode === "login" ? (
          <form className="form-grid" onSubmit={handleLogin}>
            <div>
              <p className="eyebrow">Sign In</p>
              <h2>Access your account</h2>
            </div>

            <label>
              Email
              <input
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

            <label>
              Password
              <input
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

            <button className="primary-button wide-button" disabled={status.loading} type="submit">
              {status.loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegister}>
            <div>
              <p className="eyebrow">Create Account</p>
              <h2>Create your member profile</h2>
            </div>

            <label>
              Full Name
              <input
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

            <label>
              Email
              <input
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

            <label>
              Password
              <input
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

            <button className="primary-button wide-button" disabled={status.loading} type="submit">
              {status.loading ? "Creating account..." : "Register"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
