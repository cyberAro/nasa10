import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import Simple from "./pages/Simple.jsx";
import "./styles.css";
import "./simple.css";
import Gov from "./pages/Gov.jsx";
import Backtest from "./pages/Backtest.jsx";
import Farmer from "./pages/Farmer.jsx";
import Officer from "./pages/Officer.jsx";
import Outlook from "./pages/Outlook.jsx";
import Home from "./pages/Home.jsx";

function Online() {
  const [on, setOn] = React.useState(navigator.onLine);
  React.useEffect(() => {
    const up = () => setOn(true), down = () => setOn(false);
    window.addEventListener("online", up); window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);
  return on ? null : <span className="chip warn">Offline: using saved data</span>;
}

function RequireRole({ role, children }) {
  const [state, setState] = React.useState({ role, loading: true, user: null, error: "" });
  React.useEffect(() => {
    let active = true;
    setState({ role, loading: true, user: null, error: "" });
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not verify your account. Please return home and sign in again.");
        return response.json();
      })
      .then(({ user }) => {
        if (active) setState({ role, loading: false, user, error: "" });
      })
      .catch((error) => {
        if (active) setState({ role, loading: false, user: null, error: error.message || "Could not verify your account." });
      });
    return () => { active = false; };
  }, [role]);

  if (state.role !== role || state.loading) return <div className="loading">Checking your account...</div>;
  if (state.error) return <div className="loading" role="alert">{state.error} <NavLink to="/">Return home</NavLink></div>;
  if (!state.user || !state.user.role) return <Navigate to="/" replace />;
  if (state.user.role !== role) return <Navigate to={state.user.role === "farmer" ? "/farm" : "/officer"} replace />;
  return children;
}

// Farmers get their own navigation and never see the government tools.
function Header() {
  const { pathname } = useLocation();
  const homeSide = pathname === "/";
  const farmerSide = pathname.startsWith("/farm");
  return (
    <header className="top">
      <div className="brand"><img src="/icon.svg" alt="" width="28" height="28" /><div><b>Aswanna.ai</b><small>{farmerSide ? "Crop advice for your field" : "Sri Lanka "}</small></div></div>
      {homeSide ? (
        null
      ) : farmerSide ? (
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/farm" end>Farm advice</NavLink>
          <NavLink to="/farm/recommendations">Recommended rotations</NavLink>
          <NavLink to="/farm/idea">My own idea</NavLink>
          <NavLink to="/farm/planted">Already planted</NavLink>
        </nav>
      ) : (
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">National dashboard</NavLink>
          <NavLink to="/backtest">2021 test</NavLink>
          <NavLink to="/officer">Officer</NavLink>
          <NavLink to="/outlook">Harvest outlook</NavLink>
        </nav>
      )}
      <Online />
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/farm" element={<RequireRole role="farmer"><Simple /></RequireRole>} />
          <Route path="/farm/recommendations" element={<RequireRole role="farmer"><Farmer mode="plan" /></RequireRole>} />
          <Route path="/farm/idea" element={<RequireRole role="farmer"><Farmer mode="idea" /></RequireRole>} />
          <Route path="/farm/planted" element={<RequireRole role="farmer"><Farmer mode="monitor" /></RequireRole>} />
          <Route path="/dashboard" element={<RequireRole role="officer"><Gov /></RequireRole>} />
          <Route path="/backtest" element={<RequireRole role="officer"><Backtest /></RequireRole>} />
          <Route path="/officer" element={<RequireRole role="officer"><Officer /></RequireRole>} />
          <Route path="/outlook" element={<RequireRole role="officer"><Outlook /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="foot">
        Decision support only. It does not replace farmer judgment or the advice of agricultural officers.
        Data: NASA POWER, GPM IMERG, SMAP and MODIS (via NASA GIBS), SoilGrids, Open-Meteo, DCS, HARTI, DoA, FAOSTAT. Boundaries: geoBoundaries (ODbL), Natural Earth.
      </footer>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
