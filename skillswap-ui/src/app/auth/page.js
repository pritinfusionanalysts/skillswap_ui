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
  
  // Form data state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // User profile data from backend
  const [userProfile, setUserProfile] = useState(null);

  const modeOptions = [
    { value: "ONLINE", label: "Online" },
    { value: "OFFLINE", label: "Offline" },
    { value: "HYBRID", label: "Hybrid" }
  ];

  // Handle OAuth redirect & check existing session
  useEffect(() => {
    const token = searchParams.get("token");
    const username = searchParams.get("username");

    // OAuth success redirect
    if (token) {
      localStorage.setItem("token", token);
      if (username) localStorage.setItem("username", username);
      router.push("/dashboard");
      return;
    }

    // Check existing session
    checkUserSession();
  }, [searchParams, router]);

  // Fetch user profile if token exists
  const checkUserSession = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // const response = await fetch("http://localhost:8082/api/user/profile", {
          // method: "GET",
          // headers: {
            // "Authorization": `Bearer ${token}`,
            // "Content-Type": "application/json"
          // },
        // });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          // Auto-redirect if already logged in
          router.push("/dashboard");
        } else if (response.status === 401) {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    }
  };

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
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

    // 1. Check if the response is actually okay
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.jwt);
      localStorage.setItem("username", data.username);
      router.push("/explore"); 
    } 
    // 2. If it's 401 (or any other error), handle it without crashing
    else {
      let errorMessage = "Invalid username or password.";
      try {
        // Try to get the error message from the body if it exists
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonErr) {
        // If it's not JSON (e.g., plain text 401), just use the default message
        console.log("Response was not JSON, using default error message.");
      }
      setError(errorMessage);
    }
  } catch (err) {
    // This will now only run if the network is DOWN or there's a CORS error
    setError("Server connection failed. Is the backend running?");
    console.error("Connection Error:", err);
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
        setIsSignup(false);
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

  // Show profile preview if user data loaded
  if (userProfile) {
    return (
      <div className={styles.cont}>
        <div className={styles.profilePreview}>
          <h2>Welcome back, {userProfile.username}!</h2>
          <div className={styles.profileInfo}>
          <img 
              src={`http://localhost:8082${userData.image}`}  // Full backend URL
              className={styles.avatar} 
              alt="Profile"
              onError={(e) => {
               e.currentTarget.src = "https://i.imgur.com/8Km9mS8.png";
              }}
          />
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Location:</strong> {userProfile.location || 'Not set'}</p>
            <p><strong>Mode:</strong> {userProfile.preferredMode || 'ONLINE'}</p>
          </div>
          <button onClick={() => router.push("/dashboard")} className={styles.submit}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.cont} ${isSignup ? styles.sSignup : ""}`}>
      
      {/* Sign In Form */}
      <div className={`${styles.form} ${styles.signIn}`}>
        <form onSubmit={handleLogin}>
          <h2>Welcome</h2>
          {error && !isSignup && <p style={{color: '#ff4b2b', fontSize: '12px', marginBottom: '10px'}}>{error}</p>}
          
          <label>
            <span>Username</span>
            <input 
              name="username" 
              type="text" 
              required 
              onChange={handleChange}
              value={formData.username}
            />
          </label>
          <label>
            <span>Password</span>
            <input 
              name="password" 
              type="password" 
              required 
              onChange={handleChange}
              value={formData.password}
            />
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
              <input 
                name="username" 
                type="text" 
                required 
                onChange={handleChange}
                value={formData.username}
              />
            </label>
            <label>
              <span>Email</span>
              <input 
                name="email" 
                type="email" 
                required 
                onChange={handleChange}
                value={formData.email}
              />
            </label>
            <label>
              <span>Password</span>
              <input 
                name="password" 
                type="password" 
                required 
                onChange={handleChange}
                value={formData.password}
              />
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
