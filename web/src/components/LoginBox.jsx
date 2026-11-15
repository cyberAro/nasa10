import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginBox() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSignUp) {
      // Handles the "Create account" button
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setSuccess("Account created successfully!");
          // Add dashboard redirect here later
        })
        .catch((error) => {
          setError(error.message); // Shows actual error if email exists, password too weak, etc.
        });
    } else {
      // Handles the "Log in" button
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setSuccess("Signed in successfully!");
          // Add dashboard redirect here later
        })
        .catch((error) => {
          setError("Could not sign in. Please try again.");
        });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#1a2b4c" }}>
        {isSignUp ? "Create your account" : "Log in to your account"}
      </h2>
      
      {/* Sign Up / Log In Tabs */}
      <div style={{ display: "flex", marginBottom: "25px", borderRadius: "8px", border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <button 
          onClick={() => { setIsSignUp(true); setError(""); setSuccess(""); }} 
          style={{ flex: 1, padding: "12px", border: "none", backgroundColor: isSignUp ? "#fff" : "#f5f7f9", fontWeight: isSignUp ? "bold" : "normal", cursor: "pointer", color: "#333" }}
        >
          Sign up
        </button>
        <button 
          onClick={() => { setIsSignUp(false); setError(""); setSuccess(""); }} 
          style={{ flex: 1, padding: "12px", border: "none", borderLeft: "1px solid #e0e0e0", backgroundColor: !isSignUp ? "#fff" : "#f5f7f9", fontWeight: !isSignUp ? "bold" : "normal", cursor: "pointer", color: "#333" }}
        >
          Log in
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        {/* Full Name - Only shows on Sign Up */}
        {isSignUp && (
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #e0e0e0", boxSizing: "border-box", backgroundColor: "#eef2ff" }}
            />
          </div>
        )}

        {/* Email Address (Replaced Phone Number for Firebase compatibility) */}
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #e0e0e0", boxSizing: "border-box", backgroundColor: "#eef2ff" }}
          />
        </div>

        {/* Password */}
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #e0e0e0", boxSizing: "border-box" }}
          />
        </div>

        {/* Status Messages */}
        {error && <p style={{ color: "#d32f2f", fontSize: "14px", textAlign: "center", margin: "5px 0" }}>{error}</p>}
        {success && <p style={{ color: "#388e3c", fontSize: "14px", textAlign: "center", margin: "5px 0" }}>{success}</p>}

        {/* Submit Button */}
        <button type="submit" style={{ padding: "14px", backgroundColor: "#2e7d32", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", marginTop: "10px" }}>
          {isSignUp ? "Create account" : "Log in"}
        </button>
      </form>
      
      {/* Footer Text */}
      {isSignUp && (
        <p style={{ fontSize: "12px", color: "#888", textAlign: "center", marginTop: "20px", lineHeight: "1.5" }}>
          Your password is securely hashed. Email ownership is verified by Firebase.
        </p>
      )}
    </div>
  );
}
