'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function SalesDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    today: 0,
    thisMonth: 0,
    thisYear: 0,
    average: 0,
  });
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'year', 'month', 'day', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('month'); // 'day', 'month', 'year'
  const [graphType, setGraphType] = useState('line'); // 'line', 'bar', 'area'
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'Other',
    paymentMethod: 'Cash',
    customerName: '',
    invoiceNumber: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch stats only once when user loads (always show today, this month, this year)
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Fetch sales and ledger when filters change
  useEffect(() => {
    if (user) {
      fetchSales();
      fetchLedger();
    }
  }, [user, dateFilter, startDate, endDate, groupBy]);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role?.toLowerCase() !== 'admin') {
        router.push('/');
        return;
      }
      setUser(parsedUser);
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchSales = async () => {
    try {
      let url = '/api/sales?';
      
      if (dateFilter === 'custom' && startDate && endDate) {
        url += `startDate=${startDate}&endDate=${endDate}&`;
      } else if (dateFilter === 'year') {
        const year = new Date().getFullYear();
        url += `startDate=${year}-01-01&endDate=${year}-12-31&`;
      } else if (dateFilter === 'month') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        url += `startDate=${firstDay.toISOString().split('T')[0]}&endDate=${lastDay.toISOString().split('T')[0]}&`;
      } else if (dateFilter === 'day') {
        const today = new Date().toISOString().split('T')[0];
        url += `startDate=${today}&endDate=${today}&`;
      }
      
      url += `groupBy=${groupBy}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.sales) {
        setSales(data.sales);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      showToast('Error fetching sales data', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      
      // Always fetch today, this month, and this year stats (not filtered)
      const [todayRes, monthRes, yearRes] = await Promise.all([
        fetch(`/api/sales?startDate=${today}&endDate=${today}`),
        fetch(`/api/sales?startDate=${firstDayOfMonth}&endDate=${now.toISOString().split('T')[0]}`),
        fetch(`/api/sales?startDate=${firstDayOfYear}&endDate=${now.toISOString().split('T')[0]}`),
      ]);
      
      const [todayData, monthData, yearData] = await Promise.all([
        todayRes.json(),
        monthRes.json(),
        yearRes.json(),
      ]);
      
      // For average, use all sales data
      const allSalesRes = await fetch('/api/sales');
      const allSalesData = await allSalesRes.json();
      const avg = allSalesData.count > 0 ? allSalesData.total / allSalesData.count : 0;
      
      setStats({
        today: todayData.total || 0,
        thisMonth: monthData.total || 0,
        thisYear: yearData.total || 0,
        average: avg,
        totalTransactions: allSalesData.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLedger = async () => {
    try {
      let url = '/api/sales?';
      
      // Use the same filter logic as fetchSales
      if (dateFilter === 'custom' && startDate && endDate) {
        url += `startDate=${startDate}&endDate=${endDate}`;
      } else if (dateFilter === 'year') {
        const year = new Date().getFullYear();
        url += `startDate=${year}-01-01&endDate=${year}-12-31`;
      } else if (dateFilter === 'month') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        url += `startDate=${firstDay.toISOString().split('T')[0]}&endDate=${lastDay.toISOString().split('T')[0]}`;
      } else if (dateFilter === 'day') {
        const today = new Date().toISOString().split('T')[0];
        url += `startDate=${today}&endDate=${today}`;
      }
      // If 'all', no date filter - fetch all
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.sales) {
        // If grouped data, we need individual records - fetch without groupBy
        if (data.sales.length > 0 && data.sales[0].total !== undefined) {
          // It's grouped data, fetch individual records
          let ledgerUrl = '/api/sales?';
          if (dateFilter === 'custom' && startDate && endDate) {
            ledgerUrl += `startDate=${startDate}&endDate=${endDate}`;
          } else if (dateFilter === 'year') {
            const year = new Date().getFullYear();
            ledgerUrl += `startDate=${year}-01-01&endDate=${year}-12-31`;
          } else if (dateFilter === 'month') {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            ledgerUrl += `startDate=${firstDay.toISOString().split('T')[0]}&endDate=${lastDay.toISOString().split('T')[0]}`;
          } else if (dateFilter === 'day') {
            const today = new Date().toISOString().split('T')[0];
            ledgerUrl += `startDate=${today}&endDate=${today}`;
          }
          
          const ledgerRes = await fetch(ledgerUrl);
          const ledgerData = await ledgerRes.json();
          setLedger(ledgerData.sales || []);
        } else {
          setLedger(data.sales);
        }
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
      showToast('Error fetching ledger data', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingSale ? `/api/sales/${editingSale._id}` : '/api/sales';
      const method = editingSale ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(editingSale ? 'Sale updated successfully' : 'Sale added successfully', 'success');
        setShowAddForm(false);
        setEditingSale(null);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          description: '',
          category: 'Other',
          paymentMethod: 'Cash',
          customerName: '',
          invoiceNumber: '',
        });
        fetchSales();
        fetchStats();
        fetchLedger();
      } else {
        showToast(data.error || 'Failed to save sale', 'error');
      }
    } catch (error) {
      showToast('Error saving sale', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        showToast('Sale deleted successfully', 'success');
        fetchSales();
        fetchStats();
        fetchLedger();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete sale', 'error');
      }
    } catch (error) {
      showToast('Error deleting sale', 'error');
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      date: new Date(sale.date).toISOString().split('T')[0],
      amount: sale.amount.toString(),
      description: sale.description || '',
      category: sale.category || 'Other',
      paymentMethod: sale.paymentMethod || 'Cash',
      customerName: sale.customerName || '',
      invoiceNumber: sale.invoiceNumber || '',
    });
    setShowAddForm(true);
  };

  const seedData = async () => {
    if (!confirm('This will seed 35,00,000 in sales data from 2020. Continue?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sales/seed', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(`Sales data seeded: ${data.count} records, Total: Rs. ${data.total.toLocaleString('en-PK')}`, 'success');
        fetchSales();
        fetchStats();
        fetchLedger();
      } else {
        showToast(data.error || data.message || 'Failed to seed data', 'error');
      }
    } catch (error) {
      showToast('Error seeding data', 'error');
    }
  };

  // Remove this useEffect - fetchLedger is now called in main useEffect

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Format data for charts
  const chartData = sales.map((item) => ({
    date: item.date,
    amount: item.total || item.amount,
    count: item.count || 1,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Sales Dashboard</h1>
            <p className="text-gray-400">Track and manage your sales data</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={seedData}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Seed Data
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingSale(null);
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  description: '',
                  category: 'Other',
                  paymentMethod: 'Cash',
                  customerName: '',
                  invoiceNumber: '',
                });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Sale
            </button>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 border border-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-2 font-medium">Today's Sales</p>
            <p className="text-3xl font-bold text-white">Rs. {stats.today.toLocaleString('en-PK')}</p>
            <p className="text-blue-200 text-xs mt-2">Last 24 hours</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 border border-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-2 font-medium">This Month</p>
            <p className="text-3xl font-bold text-white">Rs. {stats.thisMonth.toLocaleString('en-PK')}</p>
            <p className="text-purple-200 text-xs mt-2">Current month total</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 border border-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-sm mb-2 font-medium">This Year</p>
            <p className="text-3xl font-bold text-white">Rs. {stats.thisYear.toLocaleString('en-PK')}</p>
            <p className="text-green-200 text-xs mt-2">Year to date</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 border border-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-orange-100 text-sm mb-2 font-medium">Average Sale</p>
            <p className="text-3xl font-bold text-white">Rs. {Math.round(stats.average).toLocaleString('en-PK')}</p>
            <p className="text-orange-200 text-xs mt-2">Per transaction</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{ledger.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Best Month</p>
                <p className="text-2xl font-bold text-white">
                  {sales.length > 0 
                    ? new Date(Math.max(...sales.map(s => new Date(s.date).getTime()))).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Growth Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.thisMonth > 0 && stats.thisYear > 0 
                    ? `${Math.round((stats.thisMonth / (stats.thisYear / new Date().getMonth())) * 100 - 100)}%`
                    : '0%'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date Filter</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">All Time</option>
                <option value="year">This Year</option>
                <option value="month">This Month</option>
                <option value="day">Today</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {dateFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Graph Type</label>
              <select
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>
          </div>
        </div>

        {/* Total Sales Banner */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-8 mb-8 border border-green-500 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/50 to-transparent"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-green-100 text-sm mb-2 font-medium">Total Sales ({dateFilter === 'all' ? 'All Time' : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)})</p>
              <p className="text-5xl font-bold text-white mb-2">Rs. {total.toLocaleString('en-PK')}</p>
              <p className="text-green-200 text-sm">Based on current filter</p>
            </div>
            <div className="text-right">
              <p className="text-green-100 text-sm mb-2 font-medium">Records</p>
              <p className="text-3xl font-bold text-white mb-2">{sales.length}</p>
              <div className="flex items-center gap-2 text-green-200 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Sales Trend</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {graphType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Sales (Rs.)" />
                </LineChart>
              ) : graphType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" name="Sales (Rs.)" />
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Sales (Rs.)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Sales Ledger</h2>
            <button
              onClick={fetchLedger}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Payment</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Invoice</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length > 0 ? (
                  ledger.map((sale) => (
                    <tr key={sale._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-white">
                        {new Date(sale.date).toLocaleDateString('en-PK')}
                      </td>
                      <td className="py-3 px-4 text-green-400 font-semibold">
                        Rs. {sale.amount.toLocaleString('en-PK')}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{sale.category}</td>
                      <td className="py-3 px-4 text-gray-300">{sale.paymentMethod}</td>
                      <td className="py-3 px-4 text-gray-300">{sale.customerName || '-'}</td>
                      <td className="py-3 px-4 text-gray-300">{sale.invoiceNumber || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(sale)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(sale._id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      No sales records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingSale ? 'Edit Sale' : 'Add New Sale'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSale(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Amount (Rs.) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="Chiffon">Chiffon</option>
                        <option value="Khaddar">Khaddar</option>
                        <option value="Velvet">Velvet</option>
                        <option value="Lawn">Lawn</option>
                        <option value="Linen">Linen</option>
                        <option value="Silk">Silk</option>
                        <option value="Viscose">Viscose</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Wool">Wool</option>
                        <option value="Bridal">Bridal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Online Payment">Online Payment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Customer Name</label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Invoice Number</label>
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      {editingSale ? 'Update Sale' : 'Add Sale'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingSale(null);
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

