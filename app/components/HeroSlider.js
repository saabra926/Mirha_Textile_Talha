'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  {
    id: 1,
    image: '/Nine.png',
    alt: 'Luxury Shawl Collection',
    title: 'Premium Quality Textiles',
    subtitle: 'Crafted with Tradition Since 2020'
  },
  {
    id: 2,
    image: '/Seven.png',
    alt: 'Elegant Shawl Designs',
    title: 'Exquisite Collections',
    subtitle: 'Handcrafted Excellence'
  },
  {
    id: 3,
    image: '/Eight.png',
    alt: 'Traditional Textile Art',
    title: 'Heritage Craftsmanship',
    subtitle: 'Timeless Elegance'
  }
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isTransitioning]);

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-gray-900">
      {/* Slider Container */}
      <div className="relative w-full h-full">
        {heroImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={index === 0}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" /><stop offset="100%" style="stop-color:#374151;stop-opacity:1" /></linearGradient></defs><rect fill="url(#grad)" width="1200" height="800"/><text fill="white" font-family="sans-serif" font-size="32" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">${slide.title}</text></svg>`)}`;
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-20">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 font-serif">
                  {slide.title}
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-300">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-gray-800/80 hover:bg-gray-700/90 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-gray-800/80 hover:bg-gray-700/90 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

