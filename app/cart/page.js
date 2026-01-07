'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCart(JSON.parse(saved));
    }
    setLoading(false);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    showToast('Cart updated', 'success');
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    showToast('Item removed from cart', 'success');
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to clear your cart?')) {
      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      showToast('Cart cleared', 'success');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-400">
            {cart.length > 0
              ? `${calculateItemCount()} item${calculateItemCount() !== 1 ? 's' : ''} in your cart`
              : 'Your cart is empty'}
          </p>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium border border-red-600/30"
                >
                  Clear Cart
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 relative"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                        <p className="text-green-400 font-semibold text-lg mb-4">
                          Rs. {item.price.toLocaleString('en-PK')}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-white font-semibold text-lg min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-gray-400 text-sm mb-1">Subtotal</p>
                          <p className="text-white font-bold text-xl">
                            Rs. {(item.price * item.quantity).toLocaleString('en-PK')}
                          </p>
                        </div>
                      </div>
                    </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-4 right-4 p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700 sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Items ({calculateItemCount()})</span>
                    <span>Rs. {calculateTotal().toLocaleString('en-PK')}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold text-lg">Total</span>
                      <span className="text-green-400 font-bold text-2xl">
                        Rs. {calculateTotal().toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => window.location.href = '/categories'}
                  className="w-full mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
              <a
                href="/categories"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Shopping
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

