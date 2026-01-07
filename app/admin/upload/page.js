'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';
import { useToast } from '../../contexts/ToastContext';

export default function AdminUploadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

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
      fetchCategories();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to save category' });
        return;
      }

      showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
      setFormData({
        name: '',
        description: '',
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setErrors({});
  };

  const handleCancel = () => {
    setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    setErrors({});
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        showToast('Category deleted successfully!', 'success');
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to delete category', 'error');
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
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
              <h1 className="text-3xl font-bold text-white mb-2">Category Management</h1>
              <p className="text-gray-400">Add, update, and manage categories</p>
            </div>
            <a href="/admin">
              <Button variant="secondary">Back to Admin Panel</Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingCategory ? 'Update Category' : 'Add New Category'}
            </h2>

            {message && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                {message}
              </div>
            )}

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  placeholder="Enter category description"
                />
              </div>


              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                {editingCategory && (
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Existing Categories</h2>
            {loadingCategories ? (
              <div className="text-center py-8">
                <div className="text-white">Loading categories...</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No categories found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-bold">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-400 text-sm">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

