import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (response) => {
        if (response.status === 401) return null;
        if (!response.ok) throw new Error("Could not check your sign-in status.");
        return response.json();
      })
      .then((result) => {
        if (active) setUser(result?.user || null);
      })
      .catch(() => {
        if (active) setError("Could not check your sign-in status. Please try again.");
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function submitAuth(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = event.currentTarget;
    const payload = {
      phone: form.elements.phone.value,
      password: form.elements.password.value,
      ...(mode === "signup" ? { name: form.elements.name.value } : {}),
    };
    try {
      const response = await fetch(`/api/auth/${mode === "signup" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || "Could not sign in. Please try again.");
      setUser({ ...result.user, role: null });
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "The account service is unavailable. Start the API server and try again."
          : requestError instanceof Error
            ? requestError.message
            : "Could not connect to the account service."
      );
    } finally {
      setBusy(false);
    }
  }

  async function chooseRole(role) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ role }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || "Could not set your account role.");
      setUser(result.user);
      navigate(role === "farmer" ? "/farm" : "/officer");
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "The account service is unavailable. Try again in a moment."
          : requestError instanceof Error
            ? requestError.message
            : "Could not set your account role."
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      setUser(null);
      setMode("login");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not sign out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22v-9" />
            <path d="M12 13C8.5 13 5 10 5 6c0 0 3 0 7 7" />
            <path d="M12 13c3.5 0 7-3 7-7 0 0-3 0-7 7" />
          </svg>
          Aswanna.ai
        </div>
        <div className="navbar-links">
          <a href="#how-it-works">How it works</a>
          <a href="#roles">Community</a>
        </div>
      </nav>

      <div className="hero-container" id="overview">
        <div className="hero-text-content">
          <div className="hero-label">Aswanna.ai · Sri Lanka</div>
          <h1 className="hero-title">Better crop decisions, from field to nation.</h1>
          <p className="hero-subtitle">Aswanna.ai helps farmers explore crop choices and helps planners understand the wider harvest outlook using NASA Earth observations.</p>

          <div className="hero-badges">
            <div className="badge">🌱 Field crop advice</div>
            <div className="badge">💧 Climate &amp; water context</div>
            <div className="badge">📊 National outlook</div>
          </div>
          <p className="hero-note">Decision support for farmers and agricultural officers—not a replacement for local advice.</p>
        </div>

        {sessionLoading ? (
          <div className="login-card auth-loading">
            <p>Checking your account…</p>
          </div>
        ) : user && !user.role ? (
          <div className="role-card">
            <p className="card-kicker">ACCOUNT READY</p>
            <h3>How will you use Aswanna.ai?</h3>
            <p className="card-copy">Choose your workspace. Your account will only have access to that role’s pages.</p>

            <div className="role-options">
              <button type="button" onClick={() => chooseRole("farmer")} disabled={busy}>
                <b>🧑‍🌾 Farmer</b>
                <span>Crop advice and field planning</span>
              </button>
              <button type="button" onClick={() => chooseRole("officer")} disabled={busy}>
                <b>📋 Agricultural Officer</b>
                <span>Officer and national planning tools</span>
              </button>
            </div>

            {error && <p className="home-auth-error">{error}</p>}
            <button className="secondary-btn" type="button" onClick={signOut} disabled={busy}>Use another account</button>
          </div>
        ) : user ? (
          <div className="signed-in-card">
            <p className="card-kicker">{user.role === "farmer" ? "FARMER ACCOUNT" : "OFFICER ACCOUNT"}</p>
            <h3>Welcome, {user.name}</h3>
            <p className="card-copy">You’re signed in. Your account is limited to the {user.role} workspace.</p>

            <Link className="submit-btn continue-link" to={user.role === "farmer" ? "/farm" : "/officer"}>
              Open {user.role === "farmer" ? "farmer app" : "officer tools"}
            </Link>

            {error && <p className="home-auth-error">{error}</p>}
            <button className="secondary-btn" type="button" onClick={signOut} disabled={busy}>
              {busy ? "Please wait..." : "Log out"}
            </button>
          </div>
        ) : (
          <div className="login-card">
            <p className="card-kicker">WELCOME TO FIELD SHIFT</p>
            <h3>{mode === "signup" ? "Create your account" : "Welcome back"}</h3>

            <div className="auth-toggle">
              <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Sign up</button>
              <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Log in</button>
            </div>

            <form onSubmit={submitAuth}>
              {mode === "signup" && (
                <div className="input-group">
                  <label htmlFor="account-name">Full Name</label>
                  <input id="account-name" type="text" name="name" placeholder="e.g. Nimesh Perera" required />
                </div>
              )}
              <div className="input-group">
                <label htmlFor="account-phone">Phone number</label>
                <input id="account-phone" type="tel" name="phone" placeholder="+94 77 123 4567" required />
              </div>
              <div className="input-group">
                <label htmlFor="account-password">Password</label>
                <input id="account-password" type="password" name="password" minLength="12" placeholder={mode === "signup" ? "At least 12 characters" : "Your password"} required />
              </div>

              {error && <p className="home-auth-error">{error}</p>}
              <button className="submit-btn" type="submit" disabled={busy}>
                {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
              </button>
            </form>
            <p className="auth-footnote">
              {mode === "signup" ? "Your password is securely hashed. Phone ownership is not verified by SMS." : "Use the phone number and password you registered with."}
            </p>
          </div>
        )}
      </div>

      <section className="how-section" id="how-it-works" aria-labelledby="how-title">
        <div className="how-header">
          <p className="section-kicker">HOW IT WORKS</p>
          <h2 id="how-title">A clear path from field context to crop plan.</h2>
        </div>
        <div className="how-steps">
          <article className="how-step">
            <span>01</span>
            <h3>Describe your field</h3>
            <p>Choose your district and share your crop, water, soil, and farm-size context.</p>
          </article>
          <article className="how-step">
            <span>02</span>
            <h3>Explore your options</h3>
            <p>Compare recommended rotations, test your own idea, or check a crop already planted.</p>
          </article>
          <article className="how-step">
            <span>03</span>
            <h3>Plan with local support</h3>
            <p>Review the trade-offs and discuss your plan with an agricultural officer.</p>
          </article>
        </div>
      </section>

      <section className="tiles-section" id="roles">
        <div className="tiles-header">
          <p className="section-kicker">ONE CONNECTED VIEW</p>
          <h2>Plan for a field. Understand the<br />bigger picture.</h2>
          <p>Crop choices, climate and water conditions, and national planning tools—all in one place.</p>
        </div>

        <div className="tiles-grid">
          <article className="tile-card">
            <div className="tile-top">
              <span className="tile-number">01</span>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                <path d="M12 22v-9" />
                <path d="M12 13C8.5 13 5 10 5 6c0 0 3 0 7 7" />
                <path d="M12 13c3.5 0 7-3 7-7 0 0-3 0-7 7" />
              </svg>
            </div>
            <h4>For farmers</h4>
            <p>Explore crop options shaped by water needs and local NASA climate conditions.</p>
          </article>
          <article className="tile-card">
            <div className="tile-top">
              <span className="tile-number">02</span>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#d84315" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 14h6" />
                <path d="M9 18h6" />
                <path d="M9 10h.01" />
              </svg>
            </div>
            <h4>For officers</h4>
            <p>Review local plans and support informed conversations with farmers in your district.</p>
          </article>
          <article className="tile-card">
            <div className="tile-top">
              <span className="tile-number">03</span>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 21h18" />
                <path d="M3 10h18" />
                <path d="M5 6l7-3 7 3" />
                <path d="M4 10v11" />
                <path d="M20 10v11" />
                <path d="M8 14v3" />
                <path d="M12 14v3" />
                <path d="M16 14v3" />
              </svg>
            </div>
            <h4>For planners</h4>
            <p>Explore district outlooks, resource allocation, and national market planning scenarios.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
