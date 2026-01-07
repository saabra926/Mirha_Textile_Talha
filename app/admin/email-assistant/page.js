'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';
import { useToast } from '../../contexts/ToastContext';

export default function EmailAssistantPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailLanguage, setEmailLanguage] = useState('english');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const [showSMTPConfig, setShowSMTPConfig] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContactId, setDeletingContactId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
      setLoading(false);
      fetchContacts();
      checkSMTPConfig();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, []);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/contacts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const checkSMTPConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/smtp-config', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSmtpConfig(data.config);
      }
    } catch (error) {
      console.error('Error checking SMTP config:', error);
    }
  };

  const handleAddContact = async (name, email) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (response.ok) {
        fetchContacts();
        setMessage('Contact added successfully!');
        setError('');
      } else {
        setError(data.error || 'Failed to add contact');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleUploadExcel = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/contacts/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        fetchContacts();
        showToast(`Successfully imported ${data.count} contacts!`, 'success');
        setError('');
      } else {
        setError(data.error || 'Failed to upload contacts');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleDeleteContact = async (contactId) => {
    setDeletingContactId(contactId);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Remove from selected contacts if selected
        setSelectedContacts((prev) => prev.filter((id) => id !== contactId));
        
        // Animate deletion
        setTimeout(() => {
          fetchContacts();
          showToast('Contact deleted successfully!', 'success');
          setDeletingContactId(null);
          setShowDeleteConfirm(null);
        }, 300);
      } else {
        setError(data.error || 'Failed to delete contact');
        setDeletingContactId(null);
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setDeletingContactId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleUpdateContact = async (contactId, name, email) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (response.ok) {
        fetchContacts();
        showToast('Contact updated successfully!', 'success');
        setEditingContact(null);
        setError('');
      } else {
        setError(data.error || 'Failed to update contact');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleGenerateEmail = async () => {
    if (!aiPrompt.trim()) {
      setError('Please describe what email you want to send');
      return;
    }

    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    setGeneratingEmail(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          language: emailLanguage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedEmail(data.email);
        showToast('Email generated successfully!', 'success');
      } else {
        setError(data.error || 'Failed to generate email');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedEmail.trim()) {
      setError('Please generate an email first');
      return;
    }

    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    if (!smtpConfig) {
      setError('Please configure SMTP settings first');
      setShowSMTPConfig(true);
      return;
    }

    setSendingEmail(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contacts: selectedContacts,
          subject: `Message from ${smtpConfig.from.name}`,
          body: generatedEmail,
          language: emailLanguage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(`Successfully sent ${data.sent} email(s)!`, 'success');
        setGeneratedEmail('');
        setAiPrompt('');
        setError('');
      } else {
        setError(data.error || 'Failed to send emails');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="mb-10 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">AI Email Assistant</h1>
                <p className="text-slate-400">Professional email management powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {smtpConfig ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">SMTP Configured</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowSMTPConfig(true)}
                  className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors"
                >
                  Configure SMTP
                </button>
              )}
              <a href="/admin">
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Back to Panel
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-5 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Contacts</h3>
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{contacts.length}</p>
            <p className="text-slate-400 text-xs mt-1">Synced contacts</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-5 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Selected</h3>
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{selectedContacts.length}</p>
            <p className="text-slate-400 text-xs mt-1">Ready to send</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-5 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Draft Status</h3>
              <svg className={`w-5 h-5 ${generatedEmail ? 'text-green-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-white">
              {generatedEmail ? 'Ready to Send' : 'Awaiting Prompt'}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {generatedEmail ? 'Email generated' : 'Describe your email'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-5 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">AI Assistant</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">Online</span>
              </div>
            </div>
            <p className="text-xl font-bold text-white">
              {generatingEmail ? 'Generating...' : 'Standing By'}
            </p>
            <p className="text-slate-400 text-xs mt-1">Ready to help</p>
          </div>
        </div>

        {/* Alerts */}

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Management */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Contact Management
                </h2>
              </div>

              {/* Add Contact */}
              <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-600">
                <h3 className="text-white font-semibold mb-3 text-sm">Add New Contact</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleAddContact(formData.get('name'), formData.get('email'));
                    e.target.reset();
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-lg"
                  >
                    Add Contact
                  </button>
                </form>
              </div>

              {/* Upload Excel */}
              <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-600">
                <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Import
                </h3>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleUploadExcel(e.target.files[0]);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Excel format: Name, Email columns required
                </p>
              </div>

              {/* Contacts List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">
                    Contacts ({selectedContacts.length}/{contacts.length})
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedContacts(
                        selectedContacts.length === contacts.length
                          ? []
                          : contacts.map((c) => c._id)
                      );
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                  {loadingContacts ? (
                    <div className="text-center py-12 text-slate-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p>Loading contacts...</p>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-600">
                      <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-slate-400 text-sm">No contacts yet</p>
                      <p className="text-slate-500 text-xs mt-1">Add contacts or upload Excel sheet</p>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <div
                        key={contact._id}
                        className={`p-3 rounded-lg transition-all ${
                          deletingContactId === contact._id
                            ? 'opacity-0 scale-95 -translate-x-4'
                            : 'opacity-100 scale-100 translate-x-0'
                        } ${
                          selectedContacts.includes(contact._id)
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500 shadow-lg'
                            : 'bg-slate-900/50 border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                        }`}
                        style={{
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact._id)}
                            onChange={() => toggleContactSelection(contact._id)}
                            className="w-4 h-4 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            selectedContacts.includes(contact._id)
                              ? 'bg-white/20'
                              : 'bg-slate-700'
                          }`}>
                            <span className={`text-sm font-semibold ${
                              selectedContacts.includes(contact._id) ? 'text-white' : 'text-slate-300'
                            }`}>
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => toggleContactSelection(contact._id)}
                          >
                            <p className={`font-medium truncate ${
                              selectedContacts.includes(contact._id) ? 'text-white' : 'text-white'
                            }`}>
                              {contact.name}
                            </p>
                            <p className={`text-xs truncate ${
                              selectedContacts.includes(contact._id) ? 'text-blue-100' : 'text-slate-400'
                            }`}>
                              {contact.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingContact(contact);
                              }}
                              className="p-1.5 hover:bg-blue-600/20 rounded-lg transition-colors group"
                              title="Edit Contact"
                            >
                              <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(contact._id);
                              }}
                              className="p-1.5 hover:bg-red-600/20 rounded-lg transition-colors group"
                              title="Delete Contact"
                            >
                              <svg className="w-4 h-4 text-red-400 group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - AI Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl border border-slate-700 p-6 h-full">
              {/* AI Header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Email Assistant</h2>
                    <p className="text-slate-400 text-sm">Crafting thoughtful communication in seconds</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Online</span>
                </div>
              </div>

              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Language</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEmailLanguage('english')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      emailLanguage === 'english'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setEmailLanguage('roman-urdu')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      emailLanguage === 'roman-urdu'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    Roman Urdu
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="bg-slate-900/50 rounded-xl p-5 mb-6 min-h-[280px] max-h-[400px] overflow-y-auto border border-slate-600 custom-scrollbar">
                <div className="space-y-4">
                  {/* AI Welcome Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-slate-200 text-sm leading-relaxed">
                        Hello! I'm here to help you write high-impact marketing emails. Whether it's a discount, new service, or brand update, just describe what you want to communicate and I'll craft a professional email for you.
                      </p>
                      <p className="text-slate-500 text-xs mt-2">02:38</p>
                    </div>
                  </div>

                  {/* Generated Email */}
                  {generatedEmail && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{generatedEmail}</p>
                      </div>
                    </div>
                  )}

                  {generatingEmail && (
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <p className="text-sm">AI is generating your email...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what email you want to send... (e.g., 'Send a discount offer for 20% off on all products')"
                    className="w-full px-4 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    rows={4}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                    {aiPrompt.length} characters
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateEmail}
                    disabled={generatingEmail || !aiPrompt.trim() || selectedContacts.length === 0}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {generatingEmail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !generatedEmail.trim() || selectedContacts.length === 0}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Email
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-blue-300 text-xs leading-relaxed">
                    <span className="font-semibold">Tip:</span> Select contacts first, then describe what you want to communicate. The AI will generate a professional email tailored to your needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMTP Configuration Modal */}
        {showSMTPConfig && (
          <SMTPConfigModal
            smtpConfig={smtpConfig}
            onClose={() => setShowSMTPConfig(false)}
            onSave={() => {
              checkSMTPConfig();
              setShowSMTPConfig(false);
            }}
          />
        )}

        {/* Edit Contact Modal */}
        {editingContact && (
          <EditContactModal
            contact={editingContact}
            onClose={() => setEditingContact(null)}
            onSave={(name, email) => {
              handleUpdateContact(editingContact._id, name, email);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            contactName={contacts.find(c => c._id === showDeleteConfirm)?.name || 'this contact'}
            onConfirm={() => handleDeleteContact(showDeleteConfirm)}
            onCancel={() => setShowDeleteConfirm(null)}
            isDeleting={deletingContactId === showDeleteConfirm}
          />
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// SMTP Configuration Modal Component
function SMTPConfigModal({ smtpConfig, onClose, onSave }) {
  const [formData, setFormData] = useState({
    host: smtpConfig?.host || '',
    port: smtpConfig?.port || 587,
    secure: smtpConfig?.secure || false,
    user: smtpConfig?.auth?.user || '',
    pass: '',
    fromName: smtpConfig?.from?.name || 'Mirha Textile',
    fromEmail: smtpConfig?.from?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [smtpError, setSmtpError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSmtpError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/smtp-config', {
        method: smtpConfig ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        onSave();
      } else {
        setSmtpError(data.error || 'Failed to save SMTP configuration');
      }
    } catch (error) {
      setSmtpError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">SMTP Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {smtpError && (
          <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-medium text-sm">{smtpError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="smtp.gmail.com"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <input
              type="checkbox"
              id="secure"
              checked={formData.secure}
              onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="secure" className="text-slate-300 text-sm cursor-pointer">
              Use SSL/TLS (for port 465)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Username/Email</label>
            <input
              type="email"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">SMTP Password</label>
            <input
              type="password"
              value={formData.pass}
              onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
              required={!smtpConfig}
              placeholder={smtpConfig ? 'Leave blank to keep current password' : 'Enter SMTP password'}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">From Name</label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">From Email</label>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Contact Modal Component
function EditContactModal({ contact, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      setSaving(false);
      return;
    }

    onSave(formData.name, formData.email);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-600 animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Edit Contact</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              {saving ? 'Saving...' : 'Update Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({ contactName, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-600 animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Delete Contact</h2>
          <p className="text-slate-400">
            Are you sure you want to delete <span className="font-semibold text-white">{contactName}</span>? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Contact
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
