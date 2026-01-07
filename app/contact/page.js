'use client';

import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'Thank you for contacting us! We will get back to you soon.', 'success');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        showToast(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 pb-16">
      {/* Section 1: About Our Friendly Service */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-700">
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
                <span className="text-green-400 font-semibold text-sm uppercase tracking-wider">Our Commitment</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                We're Here to Help You
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-blue-500 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {/* Friendly Staff */}
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Friendly Staff</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our team is always ready to assist you with a warm smile and friendly attitude. We believe in building lasting relationships with our customers.
                </p>
              </div>

              {/* Quick Problem Solving */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Quick Problem Solving</h3>
                <p className="text-gray-300 leading-relaxed">
                  We understand your time is valuable. Our dedicated team works efficiently to resolve your queries and concerns as quickly as possible.
                </p>
              </div>

              {/* Customer Feedback */}
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Your Feedback Matters</h3>
                <p className="text-gray-300 leading-relaxed">
                  We listen to your suggestions and continuously improve our services based on your valuable feedback. Your voice shapes our business.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                At Mirha Textile, customer satisfaction is our top priority. Whether you have a question, need assistance, or want to share your thoughts, we're always here to help. Our team is committed to providing exceptional service and making your experience with us as smooth and enjoyable as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-gray-400">
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name & Last Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.firstName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-600 focus:ring-gray-600'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.lastName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-600 focus:ring-gray-600'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Subject & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.subject
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-600 focus:ring-gray-600'
                    }`}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-400">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-600 focus:ring-gray-600'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Message Full Row */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 resize-none ${
                    errors.message
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:ring-gray-600'
                  }`}
                  placeholder="Tell us how we can help you..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

