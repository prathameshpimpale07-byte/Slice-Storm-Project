"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, loginUser, registerUser, storeAuthToken } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";

const initialValues = { name: "", email: "", password: "" };

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { setUser } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  }

  function validate() {
    const nextErrors = {};
    if (isRegister && values.name.trim().length < 2) {
      nextErrors.name = "Enter at least 2 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (values.password.length < (isRegister ? 8 : 1)) {
      nextErrors.password = isRegister
        ? "Password must be at least 8 characters."
        : "Enter your password.";
    }
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setError("");
    setSuccess("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const body = isRegister
        ? await registerUser(values)
        : await loginUser({ email: values.email, password: values.password });

      storeAuthToken(body.token);
      setUser(body.user);
      setSuccess(isRegister ? "Account created. Taking you to the game..." : "Welcome back. Loading the game...");
      router.push("/play");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Unable to reach the server. Check that the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-cyan" />
      <div className="auth-orb auth-orb-magenta" />
      <section className="glass auth-card" aria-labelledby="auth-title">
        <Link href="/" className="auth-brand" aria-label="Slice Storm home">
          <Image className="auth-brand-logo" src="/slice-storm-logo.png" alt="" width={80} height={80} priority />
          <span className="grad-text">SLICE STORM</span>
        </Link>
        <p className="auth-kicker">{isRegister ? "NEW PLAYER" : "WELCOME BACK"}</p>
        <h1 id="auth-title">{isRegister ? "Make a player profile." : "Ready for another run?"}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? "Save your scores and see how far you can get."
            : "Sign in and get back to the fruit before it gets away."}
        </p>

        {error && <div className="auth-alert auth-alert-error" role="alert">{error}</div>}
        {success && <div className="auth-alert auth-alert-success" role="status">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <label className="auth-field">
              <span>Player name</span>
              <input
                className="input-field"
                name="name"
                value={values.name}
                onChange={updateField}
                placeholder="Choose your player name"
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <small>{fieldErrors.name}</small>}
            </label>
          )}
          <label className="auth-field">
            <span>Email address</span>
            <input
              className="input-field"
              type="email"
              name="email"
              value={values.email}
              onChange={updateField}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && <small>{fieldErrors.email}</small>}
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              className="input-field"
              type="password"
              name="password"
              value={values.password}
              onChange={updateField}
              placeholder={isRegister ? "At least 8 characters" : "Your password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && <small>{fieldErrors.password}</small>}
          </label>
          <button className="btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Connecting..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to Slice Storm?"}{" "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <Link href="/" className="auth-back">← Back to home</Link>
      </section>
    </main>
  );
}
