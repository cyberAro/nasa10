import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Points back to the firebase.js file in src

export default function LoginBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setSuccess(`Logged in as: ${userCredential.user.email}`);
      })
      .catch((error) => {
        setError("Login failed. Check your email and password.");
      });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>Sign In</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <button type="submit" style={{ padding: "10px", fontSize: "16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "15px", textAlign: "center" }}>{success}</p>}
    </div>
  );
}
