"use client";

import React, { useState } from 'react';
import styles from './messages.module.css';
import Sidebar from '../Slidebar/Slidebar'; // Import the sidebar

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(1);

  // Mock data for your SkillSwap connections
  const contacts = [
    { id: 1, name: "Alex Rivera", skill: "React Specialist", lastMsg: "Can we swap for Guitar lessons?", time: "2m ago", online: true },
    { id: 2, name: "Sarah Chen", skill: "Digital Marketing", lastMsg: "The SEO audit is ready!", time: "1h ago", online: false },
    { id: 3, name: "Jordan Smit", skill: "French Tutor", lastMsg: "See you at 5 PM for the session.", time: "3h ago", online: true },
  ];

  return (
    <div className={styles.container}>
        <Sidebar /> {/* Use the sidebar here */}
      {/* Sidebar: Contact List */}
      <div className={styles.contactList}>
        <h2 className={styles.title}>Messages</h2>
        {contacts.map((contact) => (
          <div 
            key={contact.id} 
            className={`${styles.contactCard} ${activeChat === contact.id ? styles.active : ''}`}
            onClick={() => setActiveChat(contact.id)}
          >
            <div className={styles.avatar}>
              {contact.name[0]}
              {contact.online && <span className={styles.onlineBadge}></span>}
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.contactHeader}>
                <strong>{contact.name}</strong>
                <span className={styles.time}>{contact.time}</span>
              </div>
              <p className={styles.skillTag}>{contact.skill}</p>
              <p className={styles.lastMsg}>{contact.lastMsg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Window */}
      <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          <h3>{contacts.find(c => c.id === activeChat)?.name}</h3>
          <span>Trading: {contacts.find(c => c.id === activeChat)?.skill}</span>
        </div>

        <div className={styles.messagesArea}>
          <div className={styles.messageReceived}>
            Hi! I saw you're looking to learn React. I'd love to swap for some UI design tips!
          </div>
          <div className={styles.messageSent}>
            That sounds perfect! Are you free this weekend for a Zoom call?
          </div>
        </div>

        <div className={styles.inputArea}>
          <input type="text" placeholder="Type your message..." className={styles.input} />
          <button className={styles.sendBtn}>Send</button>
        </div>
      </div>
    </div>
  );
}