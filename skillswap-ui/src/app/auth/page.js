"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./auth.module.css";
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // --- NEW: Handle Google OAuth Redirect & Existing Sessions ---
  useEffect(() => {
    const token = searchParams.get("token");
    const username = searchParams.get("username");

    if (token) {
      localStorage.setItem("token", token);
      if (username) localStorage.setItem("username", username);
      router.push("/dashboard"); // Redirect to your main app
    }
  }, [searchParams, router]);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    // Note: Your Spring Boot app should redirect back to this page with ?token=...
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
    setError("");
    
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
        // STORE DATA
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("username", data.username);
        
        // REDIRECT
        router.push("/dashboard"); 
      } else {
        setError(data.message || "Invalid username or password.");
      }
    } catch (err) {
      setError("Server connection failed. Is the backend running?");
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
    setError("");

    try {
      const response = await fetch("http://localhost:8082/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Account created successfully! Please sign in.");
        setIsSignup(false); // Move to login view
      } else {
        const data = await response.json();
        setError(data.message || "User already exists.");
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
          {error && !isSignup && <p style={{color: '#ff4b2b', fontSize: '12px', marginBottom: '10px'}}>{error}</p>}
          
          <label>
            <span>Username</span>
            <input name="username" type="text" required onChange={handleChange} />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" required onChange={handleChange} />
          </label>
          <Link href="/forgot-password" className={styles.forgotPass}>Forgot password?</Link>
          
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Processing..." : "Sign In"}
          </button>

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
            {error && isSignup && <p style={{color: '#ff4b2b', fontSize: '12px', marginBottom: '10px'}}>{error}</p>}
            
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