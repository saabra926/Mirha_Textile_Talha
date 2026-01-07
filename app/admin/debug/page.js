'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';

export default function AdminDebugPage() {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const tok = localStorage.getItem('token');
    setUserData(user);
    setToken(tok);
  }, []);

  const handleUpdateAdmin = async () => {
    try {
      // Get current user email from localStorage
      const currentUser = userData ? JSON.parse(userData) : null;
      const email = currentUser?.email || 'admin@gmail.com';
      
      const response = await fetch('/api/admin/update-to-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast(`${data.message}. Please logout and login again to refresh your session.`, 'success');
        
        // Update localStorage with new role
        if (currentUser) {
          currentUser.role = 'admin';
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        
        // Reload page after 1 second
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      } else {
        showToast('Error: ' + (data.error || 'Failed to update'), 'error');
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Debug Page</h1>
          
          <div className="space-y-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-white font-semibold mb-2">User Data (localStorage):</h2>
              <pre className="text-gray-300 text-sm overflow-auto">
                {userData ? JSON.stringify(JSON.parse(userData), null, 2) : 'No user data found'}
              </pre>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-white font-semibold mb-2">Token:</h2>
              <p className="text-gray-300 text-sm break-all">
                {token ? (token.substring(0, 50) + '...') : 'No token found'}
              </p>
            </div>

            {userData && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h2 className="text-white font-semibold mb-2">Role Check:</h2>
                <p className="text-gray-300">
                  Role: <span className="font-bold">{JSON.parse(userData).role}</span>
                </p>
                <p className="text-gray-300">
                  Is Admin: <span className="font-bold">
                    {JSON.parse(userData).role?.toLowerCase() === 'admin' ? 'YES ✓' : 'NO ✗'}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {userData && JSON.parse(userData).role?.toLowerCase() !== 'admin' && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Your account is not admin. Click the button below to update it.
                </p>
              </div>
            )}
            
            <button
              onClick={handleUpdateAdmin}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              {userData && JSON.parse(userData).role?.toLowerCase() === 'admin' 
                ? 'Refresh Admin Status' 
                : 'Update User to Admin'}
            </button>

            <a
              href="/admin"
              className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-center"
            >
              Go to Admin Panel
            </a>

            <a
              href="/admin/upload"
              className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-center"
            >
              Go to Upload Page
            </a>

            <a
              href="/login"
              className="block w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-center"
            >
              Go to Login (Refresh Session)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

