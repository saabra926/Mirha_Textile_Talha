'use client';

import { useState } from 'react';
import Image from 'next/image';

const collections = [
  {
    id: 1,
    name: 'WOOL SHAWL',
    image: '/One.png',
    alt: 'Wool Shawl Collection',
    description: 'Premium Quality Wool'
  },
  {
    id: 2,
    name: 'VELVET BRIDE AND GROOMS SHAWLS',
    image: '/Five.png',
    alt: 'Velvet Bride and Grooms Shawls',
    description: 'Luxury Wedding Collection'
  },
  {
    id: 3,
    name: 'EMBROIDERY SHAWLS',
    image: '/Three.png',
    alt: 'Embroidery Shawls',
    description: 'Handcrafted Designs'
  },
  {
    id: 4,
    name: 'PASHMINA SHAWL',
    image: '/Four.png',
    alt: 'Pashmina Shawl Collection',
    description: 'Finest Pashmina Quality'
  }
];

export default function ShopByCollection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? collections.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === collections.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 700);
  };

  // Create infinite loop by duplicating collections
  const displayCollections = [...collections, ...collections, ...collections];
  const startIndex = collections.length + currentIndex;

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title Section with Enhanced Design */}
        <div className="mb-12 sm:mb-16 lg:mb-20 text-center">
          <div className="inline-block mb-4">
            <span className="text-sm sm:text-base text-gray-400 uppercase tracking-[0.2em] font-semibold">
              Explore Our
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 font-sans tracking-tight">
            Shop By Collection
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-gray-500"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-20 h-0.5 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gray-500 to-transparent"></div>
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover our exquisite range of premium textile collections, each crafted with tradition and excellence
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Cards Container with Enhanced Design */}
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: `translateX(-${startIndex * (100 / 4)}%)`,
              }}
            >
              {displayCollections.map((collection, index) => (
                <div
                  key={`${collection.id}-${index}`}
                  className="min-w-full sm:min-w-[50%] lg:min-w-[25%] px-2 sm:px-3 lg:px-4 shrink-0"
                >
                  <div className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ width: '100%', height: '500px' }}>
                    {/* Image Container - Fixed Size for all cards */}
                    <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: '450px' }}>
                      <Image
                        src={collection.image}
                        alt={collection.alt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#f3f4f6" width="400" height="400"/><text fill="#6b7280" font-family="sans-serif" font-size="16" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">${collection.name}</text></svg>`)}`;
                        }}
                      />
                    </div>
                    
                    {/* Label Section - Transparent background, positioned above image with spacing */}
                    <div className="absolute bottom-0 left-0 right-0 pb-4 pt-2 flex items-center justify-center" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}>
                      <h3 className="text-sm sm:text-base font-semibold text-white uppercase tracking-wide text-center leading-tight px-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>
                        {collection.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Navigation Section */}
          <div className="mt-10 sm:mt-12 lg:mt-16">
            {/* Collection Indicators */}
            <div className="flex justify-center items-center gap-2 mb-6">
              {collections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsTransitioning(false), 700);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'w-8 bg-gray-400'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to collection ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-6">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={isTransitioning}
                className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-600 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:border-gray-500"
                aria-label="Previous"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-700/0 to-gray-600/0 group-hover:from-gray-700/50 group-hover:to-gray-600/50 transition-all duration-300"></div>
                <svg 
                  className="relative w-6 h-6 sm:w-7 sm:h-7 text-gray-300 group-hover:text-white transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Decorative Divider */}
              <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              
              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-600 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:border-gray-500"
                aria-label="Next"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-l from-gray-700/0 to-gray-600/0 group-hover:from-gray-700/50 group-hover:to-gray-600/50 transition-all duration-300"></div>
                <svg 
                  className="relative w-6 h-6 sm:w-7 sm:h-7 text-gray-300 group-hover:text-white transition-colors duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

