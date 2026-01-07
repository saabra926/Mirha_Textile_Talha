'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';

export default function AdminAboutUsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [aboutUs, setAboutUs] = useState({
    qualitySection: {
      title: '',
      description: '',
      image: '',
    },
    successStorySection: {
      title: '',
      story: '',
      image: '',
    },
    teamMembers: [],
    customerReviews: [],
  });

  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    picture: '',
  });

  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [editingMember, setEditingMember] = useState({
    name: '',
    role: '',
    picture: '',
  });

  const [newReview, setNewReview] = useState({
    customerName: '',
    review: '',
    rating: 5,
  });

  // Image upload handlers
  const handleImageUpload = (e, section, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (section === 'quality') {
        setAboutUs({
          ...aboutUs,
          qualitySection: {
            ...aboutUs.qualitySection,
            [field]: base64String,
          },
        });
      } else if (section === 'success') {
        setAboutUs({
          ...aboutUs,
          successStorySection: {
            ...aboutUs.successStorySection,
            [field]: base64String,
          },
        });
      }
      showToast('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleTeamMemberImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTeamMember({
        ...newTeamMember,
        picture: reader.result,
      });
      showToast('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    // Check if user is logged in and is admin
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
      fetchAboutUs();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchAboutUs = async () => {
    try {
      const response = await fetch('/api/about-us');
      const data = await response.json();
      if (data.aboutUs) {
        setAboutUs(data.aboutUs);
      }
    } catch (error) {
      console.error('Error fetching About Us:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/about-us', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(aboutUs),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Content saved successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save content', 'error');
      }
    } catch (error) {
      console.error('Error saving About Us:', error);
      showToast('Error saving content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.role) {
        setAboutUs({
          ...aboutUs,
          teamMembers: [
            ...aboutUs.teamMembers,
            {
              ...newTeamMember,
              order: aboutUs.teamMembers.length,
            },
          ],
        });
        setNewTeamMember({ name: '', role: '', picture: '' });
        showToast('Team member added', 'success');
    }
  };

  const removeTeamMember = (index) => {
    setAboutUs({
      ...aboutUs,
      teamMembers: aboutUs.teamMembers.filter((_, i) => i !== index),
    });
    showToast('Team member removed', 'success');
  };

  const startEditingMember = (index) => {
    const member = aboutUs.teamMembers[index];
    setEditingMemberIndex(index);
    setEditingMember({
      name: member.name || '',
      role: member.role || '',
      picture: member.picture || '',
    });
  };

  const cancelEditingMember = () => {
    setEditingMemberIndex(null);
    setEditingMember({
      name: '',
      role: '',
      picture: '',
    });
  };

  const updateTeamMember = (index) => {
    if (!editingMember.name || !editingMember.role) {
      showToast('Name and Role are required', 'error');
      return;
    }

    const updatedMembers = [...aboutUs.teamMembers];
    updatedMembers[index] = {
      ...editingMember,
      order: updatedMembers[index].order || index,
    };

    setAboutUs({
      ...aboutUs,
      teamMembers: updatedMembers,
    });

    cancelEditingMember();
    showToast('Team member updated successfully!', 'success');
  };

  const handleEditMemberImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingMember({
        ...editingMember,
        picture: reader.result,
      });
      showToast('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const addReview = () => {
    if (newReview.customerName && newReview.review) {
        setAboutUs({
          ...aboutUs,
          customerReviews: [
            ...aboutUs.customerReviews,
            {
              ...newReview,
              order: aboutUs.customerReviews.length,
            },
          ],
        });
        setNewReview({ customerName: '', review: '', rating: 5 });
        showToast('Review added', 'success');
    }
  };

  const removeReview = (index) => {
    setAboutUs({
      ...aboutUs,
      customerReviews: aboutUs.customerReviews.filter((_, i) => i !== index),
    });
    showToast('Review removed', 'success');
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white text-center mb-3">Manage About Us Page</h1>
          <p className="text-gray-400 text-center mb-8">Update your About Us page content</p>

          {/* Instructions Box */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              How to Add Team Members & Reviews
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <p className="font-semibold text-blue-300 mb-1">📝 Adding Team Members:</p>
                <ol className="list-decimal list-inside ml-2 space-y-1 text-gray-400">
                  <li>Scroll down to "Section 3: Team Members"</li>
                  <li>Fill in the Name, Role, and Picture URL fields</li>
                  <li>Click "Add Member" button</li>
                  <li>You can add up to 8 team members</li>
                  <li>To remove a member, click the "Remove" button next to their card</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-blue-300 mb-1">⭐ Adding Customer Reviews:</p>
                <ol className="list-decimal list-inside ml-2 space-y-1 text-gray-400">
                  <li>Scroll down to "Section 4: Customer Reviews"</li>
                  <li>Enter Customer Name, Review text, and select Rating (1-5 stars)</li>
                  <li>Click "Add Review" button</li>
                  <li>You can add unlimited reviews</li>
                  <li>To remove a review, click the "Remove" button</li>
                </ol>
              </div>
              <div className="pt-2 border-t border-blue-700">
                <p className="text-blue-300 font-semibold">💡 Tip:</p>
                <p className="text-gray-400">Don't forget to click "Save All Changes" at the bottom after making any updates!</p>
              </div>
            </div>
          </div>


          <div className="space-y-10">
            {/* Quality Section */}
            <div className="border-b border-gray-700 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Section 1: Quality</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={aboutUs.qualitySection?.title || ''}
                    onChange={(e) =>
                      setAboutUs({
                        ...aboutUs,
                        qualitySection: {
                          ...aboutUs.qualitySection,
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={aboutUs.qualitySection?.description || ''}
                    onChange={(e) =>
                      setAboutUs({
                        ...aboutUs,
                        qualitySection: {
                          ...aboutUs.qualitySection,
                          description: e.target.value,
                        },
                      })
                    }
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {aboutUs.qualitySection?.image && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-600">
                        <img
                          src={aboutUs.qualitySection.image}
                          alt="Quality Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setAboutUs({
                              ...aboutUs,
                              qualitySection: {
                                ...aboutUs.qualitySection,
                                image: '',
                              },
                            })
                          }
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          title="Remove Image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'quality', 'image')}
                          className="hidden"
                        />
                        <div className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center font-medium flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Image
                        </div>
                      </label>
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-600"></div>
                      <span className="text-gray-400 text-sm">OR</span>
                      <div className="flex-1 h-px bg-gray-600"></div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">Enter Image URL</label>
                      <input
                        type="text"
                        value={aboutUs.qualitySection?.image || ''}
                        onChange={(e) =>
                          setAboutUs({
                            ...aboutUs,
                            qualitySection: {
                              ...aboutUs.qualitySection,
                              image: e.target.value,
                            },
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Story Section */}
            <div className="border-b border-gray-700 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Section 2: Success Story</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={aboutUs.successStorySection?.title || ''}
                    onChange={(e) =>
                      setAboutUs({
                        ...aboutUs,
                        successStorySection: {
                          ...aboutUs.successStorySection,
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Story</label>
                  <textarea
                    value={aboutUs.successStorySection?.story || ''}
                    onChange={(e) =>
                      setAboutUs({
                        ...aboutUs,
                        successStorySection: {
                          ...aboutUs.successStorySection,
                          story: e.target.value,
                        },
                      })
                    }
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {aboutUs.successStorySection?.image && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-600">
                        <img
                          src={aboutUs.successStorySection.image}
                          alt="Success Story Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setAboutUs({
                              ...aboutUs,
                              successStorySection: {
                                ...aboutUs.successStorySection,
                                image: '',
                              },
                            })
                          }
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          title="Remove Image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <div className="flex gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'success', 'image')}
                          className="hidden"
                        />
                        <div className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center font-medium flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Image
                        </div>
                      </label>
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-600"></div>
                      <span className="text-gray-400 text-sm">OR</span>
                      <div className="flex-1 h-px bg-gray-600"></div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">Enter Image URL</label>
                      <input
                        type="text"
                        value={aboutUs.successStorySection?.image || ''}
                        onChange={(e) =>
                          setAboutUs({
                            ...aboutUs,
                            successStorySection: {
                              ...aboutUs.successStorySection,
                              image: e.target.value,
                            },
                          })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="border-b border-gray-700 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Section 3: Team Members</h2>
                <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                  {aboutUs.teamMembers?.length || 0} / 8 members
                </span>
              </div>
              
              {/* Add New Team Member */}
              <div className="bg-gray-700/50 rounded-lg p-6 mb-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Team Member
                </h3>
                <p className="text-gray-400 text-sm mb-4">Fill in the details below and click "Add Member"</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <div className="space-y-2">
                    {/* Image Preview for Team Member */}
                    {newTeamMember.picture && (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-500">
                        <img
                          src={newTeamMember.picture}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setNewTeamMember({ ...newTeamMember, picture: '' })}
                          className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                          title="Remove"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTeamMemberImageUpload}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center text-sm font-medium flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Photo
                      </div>
                    </label>
                    
                    {/* OR Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-600"></div>
                      <span className="text-gray-400 text-xs">OR</span>
                      <div className="flex-1 h-px bg-gray-600"></div>
                    </div>
                    
                    {/* URL Input */}
                    <input
                      type="text"
                      placeholder="Picture URL"
                      value={newTeamMember.picture}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, picture: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={addTeamMember}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Member
                </button>
              </div>

              {/* Existing Team Members */}
              <div className="space-y-4">
                {aboutUs.teamMembers?.map((member, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                  >
                    {editingMemberIndex === index ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold">Editing: {member.name}</h4>
                          <button
                            onClick={cancelEditingMember}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Name"
                            value={editingMember.name}
                            onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                            className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                          <input
                            type="text"
                            placeholder="Role"
                            value={editingMember.role}
                            onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                            className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          {/* Image Preview */}
                          {editingMember.picture && (
                            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-500">
                              <img
                                src={editingMember.picture}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => setEditingMember({ ...editingMember, picture: '' })}
                                className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                                title="Remove"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                          
                          {/* Upload Button */}
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditMemberImageUpload}
                              className="hidden"
                            />
                            <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center text-sm font-medium flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Upload Photo
                            </div>
                          </label>
                          
                          {/* OR Divider */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-gray-600"></div>
                            <span className="text-gray-400 text-xs">OR</span>
                            <div className="flex-1 h-px bg-gray-600"></div>
                          </div>
                          
                          {/* URL Input */}
                          <input
                            type="text"
                            placeholder="Picture URL"
                            value={editingMember.picture}
                            onChange={(e) => setEditingMember({ ...editingMember, picture: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => updateTeamMember(index)}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEditingMember}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-500">
                            {member.picture ? (
                              <img
                                src={member.picture}
                                alt={member.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-400">
                                {member.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{member.name}</p>
                            <p className="text-gray-400 text-sm">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingMember(index)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => removeTeamMember(index)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Section 4: Customer Reviews</h2>
                <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                  {aboutUs.customerReviews?.length || 0} reviews
                </span>
              </div>
              
              {/* Add New Review */}
              <div className="bg-gray-700/50 rounded-lg p-6 mb-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Review
                </h3>
                <p className="text-gray-400 text-sm mb-4">Enter customer details and their review below</p>
                <div className="space-y-4 mb-4">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={newReview.customerName}
                    onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <textarea
                    placeholder="Review"
                    value={newReview.review}
                    onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} Star{rating > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={addReview}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Review
                </button>
              </div>

              {/* Existing Reviews */}
              <div className="space-y-4">
                {aboutUs.customerReviews?.map((review, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold">{review.customerName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 5) ? 'text-yellow-400' : 'text-gray-600'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removeReview(index)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

