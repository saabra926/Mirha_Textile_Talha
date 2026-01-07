'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };
    
    loadUser();
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', loadUser);
    
    // Also check on focus (when user comes back to tab)
    window.addEventListener('focus', loadUser);
    
    // Close mobile menu on window resize (when switching to desktop)
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('focus', loadUser);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Content - Logo and Navigation in one row */}
        <div className="flex items-center justify-between py-4 md:py-6">
          {/* Logo Section - Left Side */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* MT Monogram - Circular */}
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 rounded-full flex items-center justify-center shrink-0 border-2 border-gray-600">
              <span className="text-white font-bold text-xl md:text-2xl">MT</span>
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col relative">
              <span className="text-gray-400 text-xs absolute -top-3 md:-top-4 left-0 hidden sm:block">SINCE 2020</span>
              <h1 className="text-xl md:text-3xl font-serif text-white font-bold leading-tight">Mirha Textile</h1>
              <p className="text-gray-400 text-xs md:text-sm">BY Talha Saleem</p>
            </div>
          </div>

          {/* Navigation Links - Desktop (Hidden on Mobile) */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-10">
            <a 
              href="/" 
              className="text-gray-300 font-sans hover:text-white transition-colors"
            >
              Home
            </a>
            
            <a 
              href="/about-us" 
              className="text-gray-300 font-sans hover:text-white transition-colors"
            >
              About Us
            </a>

            <a 
              href="/categories" 
              className="text-gray-300 font-sans hover:text-white transition-colors"
            >
             Shop
            </a>

            <a 
              href="/contact" 
              className="text-gray-300 font-sans hover:text-white transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {mounted && (
              <>
                {user ? (
                  /* User is logged in - Show first name, settings, and logout */
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.firstName?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-gray-300 text-sm font-medium hidden sm:block">
                        {user.firstName || user.name?.split(' ')[0] || 'User'}
                      </span>
                    </div>
                    <a
                      href={user.role === 'admin' ? '/admin/settings' : '/settings'}
                      className="p-2 text-gray-300 hover:text-white transition-colors"
                      aria-label="Settings"
                      title="Settings"
                    >
                      <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </a>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-300 hover:text-white transition-colors"
                      aria-label="Logout"
                      title="Logout"
                    >
                      <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* User is not logged in - Show login icon */
                  <a 
                    href="/login"
                    className="p-2 text-gray-300 hover:text-white transition-colors"
                    aria-label="Login/Signup"
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </a>
                )}
              </>
            )}
            
            {/* Cart Icon */}
            <a 
              href="/cart"
              className="p-2 text-gray-300 hover:text-white transition-colors relative"
              aria-label="Shopping Cart"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </a>
            
            {/* Favorites Icon */}
            <a 
              href="/favorites"
              className="p-2 text-gray-300 hover:text-white transition-colors relative"
              aria-label="Favorites"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </a>

            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                // Close Icon (X)
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger Icon
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Slides down when open */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-4 py-4 border-t border-gray-700">
            <a 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 font-sans hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-gray-800"
            >
              Home
            </a>
            
            <a 
              href="/about-us" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 font-sans hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-gray-800"
            >
              About Us
            </a>

            <a 
              href="/categories" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 font-sans hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-gray-800"
            >
              Shop
            </a>

            <a 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 font-sans hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-gray-800"
            >
              Contact
            </a>

            {/* Mobile User Section */}
            {mounted && user && (
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg mb-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-300 text-sm font-medium">
                    {user.firstName || user.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4">
                  <a
                    href={user.role === 'admin' ? '/admin/settings' : '/settings'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 p-2 text-gray-300 hover:text-white transition-colors text-center rounded-lg hover:bg-gray-800"
                  >
                    Settings
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {mounted && !user && (
              <a 
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 font-sans hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-gray-800"
              >
                Login / Signup
              </a>
            )}
          </nav>
        </div>
      </div>
      
      {/* Decorative Strip */}
      <div className="h-1 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
    </header>
  );
}

