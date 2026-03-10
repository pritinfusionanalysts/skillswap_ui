"uesr client";

import React from 'react';  
import Sidebar from '../Slidebar/Slidebar'; // Import the sidebar

export default function ExplorePage() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar /> {/* Use the sidebar here */}
      <div style={{ padding: '20px', flex: 1 }}>
        <h1>Explore Page</h1>
        <p>Welcome to the Explore page! Here you can discover new skills and connect with others.</p>
      </div>
    </div>
  );
}