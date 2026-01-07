'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [filters, setFilters] = useState({
    type: 'yearly', // yearly, monthly, daily, hourly
    startDate: '',
    endDate: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  });

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
      fetchSalesData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchSalesData();
    }
  }, [filters]);

  const fetchSalesData = async () => {
    setLoadingSales(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        type: filters.type,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.year && { year: filters.year.toString() }),
        ...(filters.month && { month: filters.month.toString() }),
        ...(filters.day && { day: filters.day.toString() }),
      });

      const response = await fetch(`/api/admin/sales?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSalesData(data);
      } else {
        console.error('Error fetching sales data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
              <h1 className="text-3xl font-bold text-white mb-2">Sales Dashboard</h1>
              <p className="text-gray-400">Welcome, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex gap-3">
              <a href="/admin">
                <Button variant="secondary">Back to Admin Panel</Button>
              </a>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Year (for yearly/monthly) */}
            {(filters.type === 'yearly' || filters.type === 'monthly') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                  min="2020"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>
            )}

            {/* Month (for monthly/daily) */}
            {(filters.type === 'monthly' || filters.type === 'daily') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Day (for daily/hourly) */}
            {(filters.type === 'daily' || filters.type === 'hourly') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Day</label>
                <input
                  type="date"
                  value={
                    filters.day
                      ? `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(filters.day).padStart(2, '0')}`
                      : ''
                  }
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    handleFilterChange('year', date.getFullYear());
                    handleFilterChange('month', date.getMonth() + 1);
                    handleFilterChange('day', date.getDate());
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>
            )}

            {/* Custom Date Range */}
            {filters.type === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sales Data */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Sales Data</h2>
          {loadingSales ? (
            <div className="text-center py-8">
              <div className="text-white">Loading sales data...</div>
            </div>
          ) : salesData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-white">
                  ${salesData.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-gray-700 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-white">{salesData.totalOrders || 0}</p>
              </div>
              <div className="bg-gray-700 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-2">Average Order Value</h3>
                <p className="text-3xl font-bold text-white">
                  ${salesData.averageOrderValue?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No sales data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

