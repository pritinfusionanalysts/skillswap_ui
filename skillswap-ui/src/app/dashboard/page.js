"use client";
import React, { useState } from 'react';
import styles from './Profile.module.css';
import Sidebar from '../Slidebar/Slidebar'; // Import the new sidebar

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={styles.container}>
       <Sidebar /> {/* Use the sidebar here */}

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.welcomeTitle}>Welcome, Amanda</h1>
            <p className={styles.dateText}>Tue, 07 June 2022</p>
          </div>
          {/* Add Search/Profile elements here if needed */}
        </header>

        <section className={styles.profileCard}>
          <button 
            className={styles.editBtn} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>

          <div className={styles.profileHeader}>
            <img src="https://i.imgur.com/8Km9mS8.png" className={styles.avatar} alt="Profile" />
            <div>
              <h2 style={{margin:0, color: '#333d47'}}>Alexa Rawles</h2>
              <p className={styles.dateText}>alexarawles@gmail.com</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input type="text" className={styles.inputField} placeholder="Alexa Rawles" disabled={!isEditing} />
            </div>
            <div className={styles.inputGroup}>
              <label>Nick Name</label>
              <input type="text" className={styles.inputField} placeholder="Lexie" disabled={!isEditing} />
            </div>
            <div className={styles.inputGroup}>
              <label>Gender</label>
              <select className={styles.inputField} disabled={!isEditing}>
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Country</label>
              <select className={styles.inputField} disabled={!isEditing}>
                <option>United States</option>
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
                <div style={{fontWeight: 600, fontSize: '0.9rem', color: '#333d47'}}>alexarawles@gmail.com</div>
                <div className={styles.dateText}>1 month ago</div>
              </div>
            </div>
            <button className={styles.addEmailBtn}>+ Add Email Address</button>
          </div>
        </section>
      </main>
    </div>
  );
}