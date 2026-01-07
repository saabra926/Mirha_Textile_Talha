'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    dispatched: 0,
    in_transit: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter, searchQuery]);

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

  const fetchOrders = async () => {
    try {
      let url = '/api/orders?';
      if (statusFilter !== 'all') {
        url += `status=${statusFilter}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.orders) {
        setOrders(data.orders);
        setCounts(data.counts || counts);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error fetching orders', 'error');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('Order status updated successfully', 'success');
        setEditingStatus(null);
        fetchOrders();
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch (error) {
      showToast('Error updating order', 'error');
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        showToast('Order deleted successfully', 'success');
        fetchOrders();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete order', 'error');
      }
    } catch (error) {
      showToast('Error deleting order', 'error');
    }
  };

  const seedData = async () => {
    if (!confirm('This will seed dummy order data. Continue?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders/seed', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(`Orders seeded: ${data.count} records`, 'success');
        fetchOrders();
      } else {
        showToast(data.error || 'Failed to seed data', 'error');
      }
    } catch (error) {
      showToast('Error seeding data', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-600',
      confirmed: 'bg-blue-600',
      processing: 'bg-purple-600',
      dispatched: 'bg-indigo-600',
      in_transit: 'bg-cyan-600',
      delivered: 'bg-green-600',
      completed: 'bg-emerald-600',
      cancelled: 'bg-red-600',
    };
    return colors[status] || 'bg-gray-600';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      dispatched: 'Dispatched',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Order Tracking</h1>
            <p className="text-gray-400">Track and manage all orders</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={seedData}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Seed Data
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {Object.entries(counts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`bg-gray-800 rounded-xl p-4 border-2 transition-all ${
                statusFilter === status
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <p className="text-gray-400 text-xs mb-1 capitalize">{status === 'all' ? 'All' : getStatusLabel(status)}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Orders</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number, customer name, or email..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Orders List</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Order #</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Items</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-white font-mono text-sm">{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{order.customerName}</p>
                          <p className="text-gray-400 text-xs">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white text-sm">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-green-400 font-semibold">
                        Rs. {order.totalAmount.toLocaleString('en-PK')}
                      </td>
                      <td className="py-3 px-4">
                        {editingStatus === order._id ? (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            onBlur={() => setEditingStatus(null)}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(order.status)} hover:opacity-80 transition-opacity`}
                          >
                            {getStatusLabel(order.status)}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {new Date(order.orderDate).toLocaleDateString('en-PK')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingStatus(order._id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
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
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Order Number</p>
                        <p className="text-white font-mono">{selectedOrder.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusLabel(selectedOrder.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Order Date</p>
                        <p className="text-white">{new Date(selectedOrder.orderDate).toLocaleString('en-PK')}</p>
                      </div>
                      {selectedOrder.dispatchedDate && (
                        <div>
                          <p className="text-gray-400 text-sm">Dispatched Date</p>
                          <p className="text-white">{new Date(selectedOrder.dispatchedDate).toLocaleString('en-PK')}</p>
                        </div>
                      )}
                      {selectedOrder.deliveredDate && (
                        <div>
                          <p className="text-gray-400 text-sm">Delivered Date</p>
                          <p className="text-white">{new Date(selectedOrder.deliveredDate).toLocaleString('en-PK')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Name</p>
                        <p className="text-white">{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white">{selectedOrder.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white">{selectedOrder.customerPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Payment Method</p>
                        <p className="text-white">{selectedOrder.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Payment Status</p>
                        <p className="text-white capitalize">{selectedOrder.paymentStatus}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left py-2 text-gray-300 text-sm">Product</th>
                          <th className="text-left py-2 text-gray-300 text-sm">Category</th>
                          <th className="text-right py-2 text-gray-300 text-sm">Quantity</th>
                          <th className="text-right py-2 text-gray-300 text-sm">Price</th>
                          <th className="text-right py-2 text-gray-300 text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-600">
                            <td className="py-2 text-white text-sm">{item.productName}</td>
                            <td className="py-2 text-gray-300 text-sm">{item.category}</td>
                            <td className="py-2 text-white text-sm text-right">{item.quantity}</td>
                            <td className="py-2 text-gray-300 text-sm text-right">Rs. {item.price.toLocaleString('en-PK')}</td>
                            <td className="py-2 text-white text-sm text-right font-semibold">Rs. {item.total.toLocaleString('en-PK')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="py-2 text-right text-white font-semibold">Total Amount:</td>
                          <td className="py-2 text-right text-green-400 font-bold text-lg">
                            Rs. {selectedOrder.totalAmount.toLocaleString('en-PK')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selectedOrder.shippingAddress && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
                    <div className="bg-gray-700 rounded-lg p-4 text-white">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                    <div className="bg-gray-700 rounded-lg p-4 text-white">
                      <p>{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

