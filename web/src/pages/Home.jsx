import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false); // Set to false so it doesn't fetch /api/auth/me

  // 1. Bypass /api/auth/login and move straight to role selection
  function submitAuth(event) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const enteredName = form.elements.name?.value || "Demo User";

    setUser({
      name: enteredName,
      phone: form.elements.phone.value,
      role: null, // Setting role to null automatically opens the "How will you use Aswanna.ai?" card
    });
  }

  // 2. Bypass /api/auth/role and go straight to /farm or /officer
  function chooseRole(role) {
    setUser((prev) => ({ ...prev, role }));
    navigate(role === "farmer" ? "/farm" : "/officer");
  }

  // 3. Simple local sign out
  function signOut() {
    setUser(null);
    setMode("login");
    setError("");
  }

  return (
    // ... keep the rest of your JSX below exactly the same!
