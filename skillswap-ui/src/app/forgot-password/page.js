"use client";

import { useState, useEffect } from "react";
import styles from "../auth/auth.module.css"; 
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // --- States ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300); // 300 seconds = 5 minutes

  const [data, setData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  // --- Timer Countdown Logic ---
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (e) => {
    setError("");
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // --- Password Complexity Validation ---
  const validatePassword = (pass) => {
    if (pass.length < 6) return "Password must be at least 6 characters.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Include at least one special character.";
    return null;
  };

  // --- STEP 1 & RESEND: Send OTP ---
  const handleSendEmail = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:8082/api/forgot/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (res.ok) {
        setStep(2);
        setTimer(300); // Reset timer to 5 minutes
      } else {
        setError("User not found or email failed to send.");
      }
    } catch (err) {
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Verify OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (timer === 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8082/api/forgot/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, otp: data.otp }),
      });

      if (res.ok) {
        setStep(3);
      } else {
        setError("Invalid OTP code. Please try again.");
      }
    } catch (err) {
      setError("Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: Reset Password ---
  const handleReset = async (e) => {
    e.preventDefault();
    
    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passError = validatePassword(data.newPassword);
    if (passError) {
      setError(passError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8082/api/forgot/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.newPassword }),
      });

      if (res.ok) {
        alert("Password reset successful!");
        router.push("/auth"); 
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.cont} style={{height: 'auto', minHeight: '520px', paddingBottom: '50px'}}>
        <div className={styles.form} style={{width: '100%'}}>
          
          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleSendEmail}>
              <h2>Account Recovery</h2>
              {error && <p style={{color:'red', fontSize:'12px'}}>{error}</p>}
              <label>
                <span>Email Address</span>
                <input name="email" type="email" value={data.email} required onChange={handleChange}  />
              </label>
              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? "Checking..." : "Verify Account"}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP & Timer */}
          {step === 2 && (
            <form onSubmit={timer === 0 ? handleSendEmail : handleVerifyOtp}>
              <h2>Verify OTP</h2>
              <p style={{fontSize: '13px', color: '#666', marginBottom: '10px'}}>Code sent to {data.email}</p>
              
              <div style={{
                textAlign: 'center', 
                marginBottom: '15px', 
                fontWeight: 'bold', 
                fontSize: '14px',
                color: timer < 60 ? '#ff4d4d' : '#d4af7a'
              }}>
                {timer > 0 ? `Expires in: ${formatTime(timer)}` : "OTP Expired"}
              </div>

              {error && <p style={{color:'red', fontSize:'12px', textAlign: 'center'}}>{error}</p>}
              
              {timer > 0 && (
                <label>
                  <span>4-Digit OTP</span>
                  <input name="otp" required onChange={handleChange} maxLength="4" placeholder="0000" />
                </label>
              )}

              <button 
                type="submit" 
                className={styles.submit} 
                disabled={loading}
                style={timer === 0 ? {backgroundColor: '#222', color: '#d4af7a', border: '1px solid #d4af7a'} : {}}
              >
                {loading ? "Please wait..." : timer === 0 ? "Request New OTP" : "Verify OTP"}
              </button>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleReset}>
              <h2>Set New Password</h2>
              {error && <p style={{color:'red', fontSize:'12px', padding: '0 20px', textAlign: 'center'}}>{error}</p>}
              
              <label><span>New Password</span><input name="newPassword" type="password" required onChange={handleChange} /></label>
              <label><span>Confirm Password</span><input name="confirmPassword" type="password" required onChange={handleChange} /></label>
              
              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <div 
            style={{marginTop: '25px', cursor: 'pointer', color: '#d4af7a', textAlign: 'center', fontSize: '14px'}} 
            onClick={() => router.push("/auth")}
          >
             ← Back to Sign In
          </div>
        </div>
      </div>
    </div>
  );
}