'use client';

import { useState, useEffect } from 'react';

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutUs();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!aboutUs) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 flex items-center justify-center">
        <div className="text-white text-xl">Content not available</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 pb-16">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Crafting Excellence Since 2020
          </p>
        </div>
      </section>

      {/* Section 1: Quality Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-block mb-4">
                  <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Our Promise</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {aboutUs.qualitySection?.title || 'Our Quality Commitment'}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mb-6"></div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {aboutUs.qualitySection?.description || 'We are committed to providing the highest quality textile products.'}
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Expert Craftsmanship</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                {aboutUs.qualitySection?.image ? (
                  <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl group bg-gray-900 p-4">
                    <img
                      src={aboutUs.qualitySection.image}
                      alt="Quality"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Image will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Success Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800/30 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className="text-purple-400 font-semibold text-sm uppercase tracking-wider">Our Journey</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {aboutUs.successStorySection?.title || 'Our Success Story'}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-2">
                <div className="bg-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                    {aboutUs.successStorySection?.story || 'Our journey began with a vision to provide quality textiles.'}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-6 text-gray-400">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">2020</div>
                    <div className="text-sm">Founded</div>
                  </div>
                  <div className="h-12 w-px bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">5+</div>
                    <div className="text-sm">Years Experience</div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-1">
                {aboutUs.successStorySection?.image ? (
                  <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl group bg-gray-900 p-4">
                    <img
                      src={aboutUs.successStorySection.image}
                      alt="Success Story"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Image will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Team Members */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-green-400 font-semibold text-sm uppercase tracking-wider">Meet The Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Team
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              The talented individuals who make Mirha Textile exceptional
            </p>
          </div>
          {aboutUs.teamMembers && aboutUs.teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {aboutUs.teamMembers
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((member, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:bg-gray-700 transition-all duration-300 text-center border border-gray-700 hover:border-gray-600 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-600 shadow-lg group">
                      {member.picture ? (
                        <img
                          src={member.picture}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <span className="text-4xl font-bold text-gray-400">
                            {member.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-400 text-lg">Team members will be displayed here</p>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Customer Reviews */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Customers Say
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto"></div>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Real feedback from our valued customers
            </p>
          </div>
          {aboutUs.customerReviews && aboutUs.customerReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aboutUs.customerReviews
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((review, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-gray-600 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < (review.rating || 5)
                              ? 'text-yellow-400'
                              : 'text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="mb-4">
                      <svg className="w-8 h-8 text-gray-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed italic">{review.review}</p>
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-white font-semibold">— {review.customerName}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-400 text-lg">Customer reviews will be displayed here</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

