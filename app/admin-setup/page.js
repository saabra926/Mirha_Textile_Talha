'use client';

import { useState } from 'react';
import Button from '../components/Button';
import { useToast } from '../contexts/ToastContext';

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create admin');
        setLoading(false);
        return;
      }

      if (data.credentials) {
        showToast(`Admin created! Email: ${data.credentials.email}, Password: ${data.credentials.password}`, 'success');
      } else {
        showToast(data.message || 'Admin created successfully!', 'success');
      }
      setLoading(false);
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateToAdmin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/update-to-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'admin@gmail.com' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update user');
        setLoading(false);
        return;
      }

      showToast(data.message || 'User updated to admin successfully!', 'success');
      setLoading(false);
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Admin Setup</h1>
          <p className="text-gray-400 text-center mb-8">Create or update admin user</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleCreateAdmin}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Create Admin User'}
            </Button>

            <Button
              onClick={handleUpdateToAdmin}
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Update Existing User to Admin'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-gray-300 text-sm mb-2">Admin Credentials:</p>
            <p className="text-white text-sm">Email: <span className="font-mono">admin@gmail.com</span></p>
            <p className="text-white text-sm">Password: <span className="font-mono">admin123@</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

