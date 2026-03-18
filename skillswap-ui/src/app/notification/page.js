"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Slidebar/Slidebar';
import styles from './ExplorePage.module.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BACKEND_BASE_URL = "http://localhost:8082";

export default function ExplorePage() {
  const router = useRouter();
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); 
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  const clientRef = useRef(null);
  const DEFAULT_IMAGE = `${BACKEND_BASE_URL}/uploads/profiles/default.png`;

  useEffect(() => {
    fetchAllData();
    setupWebSocket();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []);

  const setupWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token || clientRef.current) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        stompClient.subscribe('/user/queue/notifications', () => {
          fetchAllData(); 
        });
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;
  };

  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}/api/collaborations/pending?t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_BASE_URL}/api/collaborations/accepted?t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (pendingRes.ok) {
        const pData = await pendingRes.json();
        setPendingRequests(Array.isArray(pData) ? pData : []);
      }
      
      if (acceptedRes.ok) {
        const aData = await acceptedRes.json();
        setAcceptedRequests(Array.isArray(aData) ? aData : []);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_BASE_URL}/api/collaborations/accept/${requestId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Instant UI Update: Move item locally
        const itemToMove = pendingRequests.find(r => r.id === requestId);
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        if (itemToMove) {
          setAcceptedRequests(prev => [{ ...itemToMove, status: 'ACCEPTED' }, ...prev]);
        }
        // Force sync with server data
        fetchAllData();
      }
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (requestId) => {
    if (!confirm("Are you sure you want to remove this?")) return;
    
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_BASE_URL}/api/collaborations/reject/${requestId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Instant UI Update: Remove from both lists
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        setAcceptedRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Force sync with server data to ensure the list is clean
        fetchAllData();
      } else {
        alert("Failed to remove on server.");
      }
    } catch (err) {
      console.error("Remove error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getAvatarSrc = (img) => img ? (img.startsWith('http') ? img : `${BACKEND_BASE_URL}${img}`) : DEFAULT_IMAGE;

  // Determine current list based on tab
  const currentList = activeTab === 'pending' ? pendingRequests : acceptedRequests;

  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        
        <div className={styles.followerBadge}>
          <div className={styles.countNumber}>{acceptedRequests.length}</div>
          <div className={styles.countLabel}>Followers</div>
        </div>

        <header className={styles.header}>
          <h1>Network</h1>
          <div className={styles.tabGroup}>
            <button 
              className={activeTab === 'pending' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({pendingRequests.length})
            </button>
            <button 
              className={activeTab === 'accepted' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('accepted')}
            >
              Accepted ({acceptedRequests.length})
            </button>
          </div>
        </header>

        <div className={styles.grid}>
          {loading && currentList.length === 0 ? (
            <div className={styles.infoText}>Loading...</div>
          ) : (
            currentList.map((req) => (
              <div key={req.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <img 
                    src={getAvatarSrc(req.senderImage)} 
                    className={styles.avatar} 
                    alt="User" 
                    onError={(e) => e.target.src = DEFAULT_IMAGE}
                  />
                  <div className={styles.userDetails}>
                    <h3>{req.senderName || "User"}</h3>
                    <p>{req.senderEmail || "No Email"}</p>
                  </div>
                </div>

                <div className={styles.actions}>
                  {activeTab === 'pending' ? (
                    <button 
                      className={styles.acceptBtn}
                      onClick={() => handleAccept(req.id)}
                      disabled={processingId === req.id}
                    >
                      {processingId === req.id ? "..." : "Accept"}
                    </button>
                  ) : (
                    <button 
                      className={styles.removeBtn}
                      onClick={() => handleRemove(req.id)}
                      disabled={processingId === req.id}
                    >
                      {processingId === req.id ? "..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {!loading && currentList.length === 0 && (
            <div className={styles.infoText}>No {activeTab} users found.</div>
          )}
        </div>
      </main>
    </div>
  );
}