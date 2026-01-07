export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content - Four Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* ABOUT US Column */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4">ABOUT US</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              We provide high-quality textile products and shawls for all your needs.
            </p>
          </div>

          {/* QUICK LINKS Column */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.instagram.com/mirha.textile?igsh=eGo0dnh1ZDgxbXZm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white underline transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/+923297760928" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white underline transition-colors"
                >
                  Whatsapp
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/share/1CMfD2YHcD/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white underline transition-colors"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* SERVICES Column */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4">SERVICES</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/" 
                  className="text-gray-300 hover:text-white underline transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="/login" 
                  className="text-gray-300 hover:text-white underline transition-colors"
                >
                  Login
                </a>
              </li>
              <li>
                <a 
                  href="/signup" 
                  className="text-gray-300 hover:text-white underline transition-colors"
                >
                  Signup
                </a>
              </li>
              <li>
                <a 
                  href="/cart" 
                  className="text-gray-300 hover:text-white underline transition-colors"
                >
                  Cart
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT Column */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4">CONTACT</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Faisalabad, GM Abad, PK</li>
              <li>
                <a 
                  href="mailto:info@mirhatextile.com" 
                  className="hover:text-white transition-colors"
                >
                  info@mirhatextile.com
                </a>
              </li>
              <li>
                <a 
                  href="tel:+923144885177" 
                  className="hover:text-white transition-colors"
                >
                  +92 314 4885177
                </a>
              </li>
              <li>
                <a 
                  href="tel:+923297760928" 
                  className="hover:text-white transition-colors"
                >
                  +92 329 7760928
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-300 text-sm">
            © 2020 Copyright: <a href="/" className="text-gray-400 underline hover:text-white transition-colors">Mirha Textile</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

