"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../Slidebar/Slidebar'; 

export default function ExplorePage() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  // Constants
  const BACKEND_URL = "http://localhost:8082";
  const DEFAULT_IMAGE = `${BACKEND_URL}/uploads/profiles/default.png`;
  const EMERGENCY_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8+R8AAnkB7W9909EAAAAASUVORK5CYII=";

  const fetchUsers = async (pageNumber) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const apiPage = pageNumber - 1; 
      const response = await fetch(
        `${BACKEND_URL}/api/collaborations/alluser?page=${apiPage}&size=8`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      setUsers(data.content || []); 
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleCollaborate = async (receiverId, receiverName) => {
    setSendingId(receiverId); 
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in to send requests.");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/collaborations/send/${receiverId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(`Request successfully sent to ${receiverName}!`);
        
        // --- THE LOGIC FIX ---
        // Instantly remove the user from the list so the receiver can't see the button anymore
        setUsers(prevUsers => prevUsers.filter(user => user.id !== receiverId));
        
      } else {
        const errorMsg = await response.text();
        alert(errorMsg || "Failed to send request.");
      }
    } catch (error) {
      console.error("Collaboration Error:", error);
      alert("Network error.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Explore Partners</h1>
            <p className="text-sm text-gray-500">Discover skills and start collaborating</p>
          </div>
          {users.length > 0 && (
            <div className="text-xs font-medium text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-gray-400">Loading skills...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <div key={user.id || index} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-teal-50 bg-gray-50 shadow-inner">
                      <img 
                        src={user.image ? `${BACKEND_URL}${user.image}` : DEFAULT_IMAGE} 
                        alt={user.username} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = EMERGENCY_IMAGE; 
                        }}
                      />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{user.username}</h3>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2">
                      {user.location || "Remote"}
                    </p>
                    
                    <p className="text-sm text-gray-500 text-center line-clamp-2 mb-4 h-10 px-2">
                      {user.bio || "No bio provided yet."}
                    </p>

                    <div className="w-full pt-4 border-t border-gray-50 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{user.preferredMode || 'Any'}</span>
                        <span className="text-green-500">{user.availability || 'Available'}</span>
                      </div>

                      <button 
                        onClick={() => handleCollaborate(user.id, user.username)}
                        disabled={sendingId === user.id}
                        className={`w-full text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 ${
                          sendingId === user.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'
                        }`}
                      >
                        {sendingId === user.id ? 'Sending...' : 'Collaborate'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No partners found. Try refreshing later!</p>
                </div>
              )}
            </div>

            {/* RESTORED PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-3">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border rounded-xl disabled:opacity-20 hover:bg-white hover:border-teal-500 transition-all"
                >
                  ←
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl border font-bold transition-all ${
                      currentPage === i + 1 
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border rounded-xl disabled:opacity-20 hover:bg-white hover:border-teal-500 transition-all"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}