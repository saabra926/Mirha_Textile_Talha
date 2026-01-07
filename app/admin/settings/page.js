'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      console.log('No user data or token found, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('User data:', parsedUser);
      console.log('User role:', parsedUser.role);
      
      // Case-insensitive role check
      if (parsedUser.role?.toLowerCase() !== 'admin') {
        console.log('User is not admin, redirecting to home');
        router.push('/');
        return;
      }

      setUser(parsedUser);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mt-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-10">
          <h1 className="text-3xl font-bold text-white text-center mb-3">Admin Settings</h1>
          <p className="text-gray-400 text-center mb-10">View your admin account information</p>

          <div className="space-y-8">
            {/* First Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">First Name</label>
              <input
                type="text"
                value={user?.firstName || ''}
                readOnly
                className="w-full px-5 py-3.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">This field cannot be changed</p>
            </div>

            {/* Last Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Last Name</label>
              <input
                type="text"
                value={user?.lastName || ''}
                readOnly
                className="w-full px-5 py-3.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">This field cannot be changed</p>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-5 py-3.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">This field cannot be changed</p>
            </div>

            {/* Role - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Role</label>
              <input
                type="text"
                value={user?.role?.toUpperCase() || ''}
                readOnly
                className="w-full px-5 py-3.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>

            <div className="pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm text-center">
                Admin account information is managed by the system and cannot be modified.
              </p>
            </div>

            {/* Admin Quick Links */}
            <div className="pt-8 border-t border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <a
                  href="/admin"
                  className="p-5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gray-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Panel</h3>
                      <p className="text-gray-400 text-xs">Admin Panel</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/admin/upload"
                  className="p-5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gray-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Upload</h3>
                      <p className="text-gray-400 text-xs">Upload Categories</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/admin/email-assistant"
                  className="p-5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600 hover:border-gray-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Email</h3>
                      <p className="text-gray-400 text-xs">AI Email Assistant</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

