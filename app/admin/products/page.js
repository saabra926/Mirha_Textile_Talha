'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';

export default function AdminProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    price: '',
    images: [],
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
  });

  useEffect(() => {
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
      fetchCategories();
      fetchProducts();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchCategories = async () => {
    // Hardcoded categories
    const hardcodedCategories = [
      { _id: 'chifon', name: 'Chifon' },
      { _id: 'khaddar', name: 'Khaddar' },
      { _id: 'velvet', name: 'Velvet' },
      { _id: 'lawn', name: 'Lawn' },
      { _id: 'linen', name: 'Linen' },
      { _id: 'silk', name: 'Silk' },
      { _id: 'viscose', name: 'Viscose' },
      { _id: 'cotton', name: 'Cotton' },
      { _id: 'wool', name: 'Wool' },
      { _id: 'bridal', name: 'Bridal' },
    ];
    setCategories(hardcodedCategories);
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + formData.images.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('Please select valid image files', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.category || !formData.price) {
      showToast('Category and price are required', 'error');
      setSaving(false);
      return;
    }

    if (formData.images.length === 0) {
      showToast('At least one image is required', 'error');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Use category name as product name
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      const productData = {
        ...formData,
        name: selectedCategory ? selectedCategory.name : 'Product',
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Product added successfully!', 'success');
        setFormData({
          description: '',
          category: '',
          price: '',
          images: [],
        });
        fetchProducts();
      } else {
        showToast(data.error || 'Failed to add product', 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showToast('Error adding product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    // Add to hardcoded categories list
    const newCat = {
      _id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCategory.name,
    };
    
    setCategories([...categories, newCat]);
    showToast('Category added successfully!', 'success');
    setNewCategory({ name: '' });
    setShowNewCategoryForm(false);
    setFormData({ ...formData, category: newCat._id });
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
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Product Management</h1>
              <p className="text-gray-400">Add and manage products</p>
            </div>
            <a href="/admin">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Back to Admin Panel
              </button>
            </a>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('success')
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Product Form */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    {showNewCategoryForm ? 'Cancel' : '+ New Category'}
                  </button>
                </div>

                {/* New Category Form */}
                {showNewCategoryForm && (
                  <div className="mt-4 p-4 bg-gray-700/50 rounded-lg space-y-3">
                    <input
                      type="text"
                      placeholder="Category Name *"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Add Category
                    </button>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Images (1-5) <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  disabled={formData.images.length >= 5}
                />
                <p className="text-gray-400 text-xs mt-1">
                  {formData.images.length}/5 images uploaded
                </p>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* Products List */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">All Products ({products.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-4"
                  >
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{product.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {product.category?.name || 'No category'} - ${product.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No products yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

