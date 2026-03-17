import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, login } from "../services/authService.js";

const Auth = () => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const resetFields = () => {
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const user =
        mode === "signup"
          ? await signup({ username, password })
          : await login({ username, password });

      if (mode === "signup") {
        setSuccess("Account created successfully! Please login to continue.");
        setMode("login");
        resetFields();
        return;
      }

      window.localStorage.setItem("rendUser", JSON.stringify(user));
      navigate("/user-type");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[80vh] items-center justify-center">
      <div className="card-solid w-full max-w-md p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {mode === "signup" ? "Create your account" : "Login"}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {mode === "signup"
                ? "Sign up to list properties and manage rentals."
                : "Welcome back. Continue to your dashboard."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost px-2 py-1 text-xs"
              onClick={() => navigate("/")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-ghost px-2 py-1 text-xs text-primary hover:text-primary-dark"
              onClick={() => {
                setError("");
                setSuccess("");
                resetFields();
                setMode((m) => (m === "signup" ? "login" : "signup"));
              }}
            >
              {mode === "signup" ? "Use existing account" : "New here? Sign up"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="label" htmlFor="auth-username">
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-full"
              placeholder="Your username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="At least 6 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Tip: Use a unique password you don’t use elsewhere.
            </p>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-500" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs font-semibold text-green-600" role="status">
              {success}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Please wait…" : mode === "signup" ? "Sign up" : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Auth;
