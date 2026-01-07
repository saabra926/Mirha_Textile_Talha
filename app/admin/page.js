'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/Button';
import { useToast } from '../contexts/ToastContext';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user is logged in and is admin
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userData || !token) {
        console.log('No user data or token found, redirecting to login');
        setTimeout(() => router.push('/login'), 100);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        console.log('User data:', parsedUser);
        console.log('User role:', parsedUser.role);
        console.log('Role check:', parsedUser.role?.toLowerCase(), '===', 'admin');
        
        // Case-insensitive role check
        if (parsedUser.role?.toLowerCase() !== 'admin') {
          console.log('User is not admin, redirecting to home');
          console.log('Current role:', parsedUser.role);
          // Don't redirect immediately, show error first
          showToast(`Access Denied! Your role is: "${parsedUser.role || 'undefined'}". Required role: "admin". Please update your account to admin role.`, 'error');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        setUser(parsedUser);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        showToast('Error parsing user data. Please login again.', 'error');
        setTimeout(() => router.push('/login'), 100);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading...</div>
          <div className="text-gray-400 text-sm">
            Checking admin access...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-gray-400">Welcome, {user?.firstName || user?.name?.split(' ')[0] || 'Admin'}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-white">$0</p>
          </div>
        </div>

        {/* Admin Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <a href="/admin/sales" className="block">
            <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Sales Dashboard</h3>
                  <p className="text-gray-400 text-sm">View sales analytics, graphs & ledger</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/upload" className="block">
            <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Category Management</h3>
                  <p className="text-gray-400 text-sm">Manage categories & images</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/products" className="block">
            <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Product Management</h3>
                  <p className="text-gray-400 text-sm">Add & manage products</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/about-us" className="block">
            <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">About Us</h3>
                  <p className="text-gray-400 text-sm">Manage About Us page</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/orders" className="block">
            <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Order Tracking</h3>
                  <p className="text-gray-400 text-sm">Track & manage orders</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/settings" className="block">
            <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Settings</h3>
                  <p className="text-gray-400 text-sm">View account info</p>
                </div>
              </div>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <a href="/admin/email-assistant" className="block">
            <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer border-2 border-transparent hover:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Email Assistant</h3>
                  <p className="text-gray-400 text-sm">AI-powered bulk emails</p>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Admin Content */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/admin/dashboard" className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <h3 className="text-white font-semibold mb-2">View Sales Dashboard</h3>
              <p className="text-gray-400 text-sm">Analyze sales with filters and time periods</p>
            </a>
            <a href="/admin/upload" className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <h3 className="text-white font-semibold mb-2">Manage Categories</h3>
              <p className="text-gray-400 text-sm">Add, update, or delete categories and images</p>
            </a>
            <a href="/admin/about-us" className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <h3 className="text-white font-semibold mb-2">Manage About Us</h3>
              <p className="text-gray-400 text-sm">Update quality section, success story, team members, and reviews</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

