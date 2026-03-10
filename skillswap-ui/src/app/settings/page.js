"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Profile.module.css';
import Sidebar from '../Slidebar/Slidebar';

const BACKEND_BASE_URL = "http://localhost:8082";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    gender: "",
    image: "",
    bio: "",
    location: "",
    availability: "",
    preferredMode: "ONLINE"
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const modeOptions = [
    { value: "ONLINE", label: "Online" },
    { value: "OFFLINE", label: "Offline" },
    { value: "HYBRID", label: "Hybrid" }
  ];

  // This is the default from your backend
  const DEFAULT_AVATAR = `${BACKEND_BASE_URL}/uploads/profiles/default.png`;
  // This is a final "safety net" external URL that won't fail
  const FINAL_FALLBACK = "https://i.imgur.com/8Km9mS8.png";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/profile-data`, {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); 
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    formData.append('email', userData.email || '');
    formData.append('gender', userData.gender || '');
    formData.append('bio', userData.bio || '');
    formData.append('location', userData.location || '');
    formData.append('availability', userData.availability || '');
    formData.append('preferredMode', userData.preferredMode || 'ONLINE');
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/update-profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(""); 
        
        const updatedResponse = await fetch(`${BACKEND_BASE_URL}/api/profile-data`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const updatedData = await updatedResponse.json();
        setUserData(updatedData);
      } else {
        const errorText = await response.text();
        alert("Failed to update profile: " + errorText);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile.");
    }
  };

  const getImageSrc = () => {
    if (imagePreview) return imagePreview; 
    if (userData.image) {
      return userData.image.startsWith('http') ? userData.image : `${BACKEND_BASE_URL}${userData.image}`;
    }
    return DEFAULT_AVATAR; 
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
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
            className={`${styles.editBtn} ${isEditing ? styles.saveBtn : ''}`} 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? 'Save Changes' : ' Edit Profile'}
          </button>

          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              <img 
                src={getImageSrc()} 
                className={styles.avatar} 
                alt="Profile" 
                onError={(e) => { 
                  // If we tried the backend default and it failed, use the final fallback
                  if (e.target.src !== DEFAULT_AVATAR) {
                    e.target.src = DEFAULT_AVATAR;
                  } else {
                    e.target.onerror = null; // Stop any further retries
                    e.target.src = FINAL_FALLBACK;
                  }
                }}
              />
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            <div>
              <h2 style={{margin: 0, color: '#333d47'}}>{userData.username}</h2>
              <p className={styles.dateText}>{userData.email}</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input 
                name="username"
                type="text" 
                className={styles.inputField} 
                value={userData.username || ""} 
                disabled={true}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input 
                name="email"
                type="email" 
                className={styles.inputField} 
                value={userData.email || ""} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Gender</label>
              <select 
                name="gender"
                className={styles.inputField} 
                value={userData.gender || ""} 
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Location</label>
              <input 
                name="location"
                type="text" 
                className={styles.inputField} 
                value={userData.location || ""} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Bio</label>
              <textarea 
                name="bio"
                className={styles.textareaField} 
                value={userData.bio || ""} 
                onChange={handleInputChange}
                rows="3"
                disabled={!isEditing}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Availability</label>
              <input 
                name="availability"
                type="text" 
                className={styles.inputField} 
                value={userData.availability || ""} 
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Preferred Mode</label>
              <select 
                name="preferredMode"
                className={styles.inputField} 
                value={userData.preferredMode || "ONLINE"} 
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                {modeOptions.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Profile Picture</label>
              <div className={styles.imageInfo}>
                <input 
                  type="text" 
                  className={styles.inputField} 
                  value={imageFile ? "✅ New image selected" : (userData.image ? "✅ Image uploaded" : "No image set")} 
                  readOnly
                />
                {isEditing && (
                  <button 
                    type="button" 
                    className={styles.changeImageBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 Choose New Image
                  </button>
                )}
              </div>
            </div>
          </div>          
        </section>
      </main>
    </div>
  );
}