"use client";

import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BACKEND_BASE_URL = "http://localhost:8082";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const clientRef = useRef(null); // Use a ref to prevent multiple connections

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Prevent multiple connections during Fast Refresh
    if (clientRef.current) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_BASE_URL}/ws`),
      connectHeaders: {
        // This MUST match what your WebSocketAuthInterceptor is looking for
        Authorization: `Bearer ${token}`,
      },
      debug: (msg) => {
        console.log("STOMP Debug:", msg);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
     
      
      // The subscription path for convertAndSendToUser
      stompClient.subscribe('/user/queue/notifications', (message) => {
        
        
        if (message.body) {
          // Play notification sound
          const audio = new Audio('/sounds/notification.mp3'); 
          audio.play().catch(() => console.log("Audio play blocked by browser"));

          // Set visual cue
          setHasNewNotification(true);

          // Optional: Show a browser notification or alert
          // alert("🔔 " + message.body); 
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker error:', frame.headers['message']);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []);

  // Clear the notification dot when the user views notifications
  useEffect(() => {
    if (pathname === '/notification') {
      setHasNewNotification(false);
    }
  }, [pathname]);

  const getActiveClass = (path) => {
    return pathname === path ? `${styles.icon} ${styles.active}` : styles.icon;
  };

  const handleLogout = () => {
    if (clientRef.current) clientRef.current.deactivate();
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.iconContainer}>
        {/* Home */}
        <Link href="/explore" className={getActiveClass('/explore')} title="Explore">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </Link>

        {/* Message */}
        <Link href="/message" className={getActiveClass('/message')} title="Message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </Link>

        {/* Notifications */}
        <Link href="/notification" className={getActiveClass('/notification')} title="Notifications" style={{ position: 'relative' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          
          {/* THE RED DOT */}
          {hasNewNotification && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ff4b4b',
              borderRadius: '50%',
              border: '2px solid white'
            }}></span>
          )}
        </Link>

        {/* Settings */}
        <Link href="/settings" className={getActiveClass('/settings')} title="Settings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.72l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </Link>
      </div>

      <div className={styles.logoutContainer}>
        <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  );
}