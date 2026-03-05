"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Profile.module.css';
import Sidebar from '../Slidebar/Slidebar';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for user data
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    fullName: "",
    nickName: "",
    gender: "Female",
    country: "United States"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("ProfilePage: Retrieved token:", token);

    // 1. Guard Clause: If no token, kick them back to login
    if (!token) {
      router.push("/auth"); // or wherever your login page is
      return;
    }

    // 2. Fetch User Profile from Backend
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/user/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          router.push("/auth");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setIsEditing(false);
    
    // Optional: Send updated data to backend
    try {
      await fetch("http://localhost:8082/api/user/update", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });
      alert("Profile updated!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading profile...</div>;
  }

  return (
    <div className={styles.container}>
       <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.welcomeTitle}>Welcome, {userData.username || 'User'}</h1>
            <p className={styles.dateText}>{new Date().toDateString()}</p>
          </div>
        </header>

        <section className={styles.profileCard}>
          <button 
            className={styles.editBtn} 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>

          <div className={styles.profileHeader}>
            <img src="https://i.imgur.com/8Km9mS8.png" className={styles.avatar} alt="Profile" />
            <div>
              <h2 style={{margin:0, color: '#333d47'}}>{userData.fullName || userData.username}</h2>
              <p className={styles.dateText}>{userData.email}</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input 
                name="fullName"
                type="text" 
                className={styles.inputField} 
                value={userData.fullName || ""} 
                onChange={handleInputChange}
                disabled={!isEditing} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Nick Name</label>
              <input 
                name="nickName"
                type="text" 
                className={styles.inputField} 
                value={userData.nickName || ""} 
                onChange={handleInputChange}
                disabled={!isEditing} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Gender</label>
              <select 
                name="gender"
                className={styles.inputField} 
                value={userData.gender} 
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Country</label>
              <select 
                name="country"
                className={styles.inputField} 
                value={userData.country} 
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="United States">United States</option>
                <option value="India">India</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>
          </div>

          <div className={styles.emailSection}>
            <h4 style={{color: '#333d47'}}>My email Address</h4>
            <div className={styles.emailRow}>
              <div className={styles.emailIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <div style={{fontWeight: 600, fontSize: '0.9rem', color: '#333d47'}}>{userData.email}</div>
                <div className={styles.dateText}>Primary Email</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}