"use client";

import { useState } from "react";
import styles from "./auth.module.css";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Google Login Handler
  const handleGoogleLogin = () => {
    // Redirects the entire window to your backend OAuth2 entry point
    window.location.href = "http://localhost:8082/oauth2/authorization/google";
  };

  const validatePassword = (pass) => {
    if (pass.length < 6) return "Password must be at least 6 characters long.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Include a special character.";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8082/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.jwt);
        alert(`Welcome back, ${data.username}!`);
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const passError = validatePassword(formData.password);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8082/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Account created successfully!");
        setIsSignup(false);
      } else {
        setError("User already exists.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.cont} ${isSignup ? styles.sSignup : ""}`}>
      
      {/* Sign In Form */}
      <div className={`${styles.form} ${styles.signIn}`}>
        <form onSubmit={handleLogin}>
          <h2>Welcome</h2>
          {error && !isSignup && <p style={{color: 'red', fontSize: '12px'}}>{error}</p>}
          
          <label>
            <span>Username</span>
            <input name="username" type="text" required onChange={handleChange} />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required onChange={handleChange} />
          </label>
          <p className={styles.forgotPass}>Forgot password?</p>
          
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Google Button */}
          <button type="button" onClick={handleGoogleLogin} className={styles.googleBtn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" />
            Continue with Google
          </button>
        </form>
      </div>

      <div className={styles.subCont}>
        <div className={styles.img}>
          <div className={`${styles.imgText} ${styles.mUp}`}>
            <h3>Don't have an account?</h3>
          </div>
          <div className={`${styles.imgText} ${styles.mIn}`}>
            <h3>Already have an account?</h3>
          </div>
          <div className={styles.imgBtn} onClick={() => { setIsSignup(!isSignup); setError(""); }}>
            <span className={styles.mUp}>Sign Up</span>
            <span className={styles.mIn}>Sign In</span>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className={`${styles.form} ${styles.signUp}`}>
          <form onSubmit={handleSignup}>
            <h2>Create Account</h2>
            {error && isSignup && <p style={{color: 'red', fontSize: '12px'}}>{error}</p>}
            
            <label>
              <span>Username</span>
              <input name="username" type="text" required onChange={handleChange} />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" required onChange={handleChange} />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" required onChange={handleChange} />
            </label>
            
            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>

            {/* Google Button */}
            <button type="button" onClick={handleGoogleLogin} className={styles.googleBtn}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" />
              Sign up with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}