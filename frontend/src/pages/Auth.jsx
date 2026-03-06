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
      } else {
        window.localStorage.setItem("rendUser", JSON.stringify(user));
        navigate("/user-type");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setError("Google sign-in is not configured yet. Ask your developer to connect Google OAuth.");
  };

  return (
    <section className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            {mode === "signup" ? "Create your account" : "Login"}
          </h1>
          <div className="flex items-center gap-2">
            <button
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              onClick={() => navigate("/")}
            >
              Back
            </button>
            <button
              className="text-xs font-semibold text-primary hover:text-primary-dark"
              onClick={() => {
                setError("");
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
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your username"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-500" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs font-semibold text-green-600" role="alert">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Please wait…" : mode === "signup" ? "Sign up" : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Auth;

