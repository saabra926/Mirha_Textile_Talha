'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function ShopPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [zoomImage, setZoomImage] = useState({ src: '', x: 0, y: 0, show: false });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadFavorites();
    loadCart();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory 
        ? `/api/products?category=${selectedCategory}`
        : '/api/products';
      const response = await fetch(url);
      const data = await response.json();
      console.log('Products data:', data); // Debug log
      if (data.products) {
        setProducts(data.products);
        console.log('Products set:', data.products.length); // Debug log
      } else {
        console.log('No products in response');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/public');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const loadCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCart(JSON.parse(saved));
    }
  };

  const toggleFavorite = (productId) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    if (favorites.includes(productId)) {
      showToast('Removed from favorites', 'success');
    } else {
      showToast('Added to favorites', 'success');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product._id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      showToast('Cart updated', 'success');
    } else {
      newCart = [...cart, {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        quantity: 1,
      }];
      showToast('Added to cart', 'success');
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleImageHover = (e, imageSrc) => {
    if (!imageSrc) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setZoomImage({
      src: imageSrc,
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      show: true,
    });
  };

  const handleImageLeave = () => {
    setZoomImage({ ...zoomImage, show: false });
  };

  const handleImageMove = (e) => {
    if (!zoomImage.show) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setZoomImage({
      ...zoomImage,
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 pb-16">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Products
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our premium collection of quality textiles
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-6 py-2 rounded-full transition-colors ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-6 py-2 rounded-full transition-colors ${
                    selectedCategory === category._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">Loading products...</div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-all duration-500 hover:shadow-2xl group hover:-translate-y-2"
                >
                  {/* Image Container with Hover Zoom */}
                  <div
                    className="relative h-72 overflow-hidden cursor-pointer bg-gray-900"
                    onClick={() => setSelectedProduct(product)}
                    onMouseMove={(e) => product.images[0] && handleImageMove(e)}
                    onMouseEnter={(e) => product.images[0] && handleImageHover(e, product.images[0])}
                    onMouseLeave={handleImageLeave}
                  >
                    {product.images[0] ? (
                      <>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            zoomImage.show && zoomImage.src === product.images[0]
                              ? 'scale-150'
                              : 'group-hover:scale-110'
                          }`}
                          style={{
                            transformOrigin: zoomImage.show && zoomImage.src === product.images[0]
                              ? `${zoomImage.x}% ${zoomImage.y}%`
                              : 'center center',
                          }}
                        />
                        {/* Zoom Lens Effect */}
                        {zoomImage.show && zoomImage.src === product.images[0] && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div
                              className="absolute w-32 h-32 border-2 border-white/50 rounded-full"
                              style={{
                                left: `${zoomImage.x}%`,
                                top: `${zoomImage.y}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product._id);
                        }}
                        className="relative bg-white/90 backdrop-blur-md p-2.5 rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg group/btn"
                        title={favorites.includes(product._id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <svg
                          className={`w-5 h-5 transition-colors ${
                            favorites.includes(product._id)
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-700'
                          }`}
                          fill={favorites.includes(product._id) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none shadow-xl">
                          {favorites.includes(product._id) ? 'Remove from favorites' : 'Add to favorites'}
                        </span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="relative bg-white/90 backdrop-blur-md p-2.5 rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg group/btn"
                        title="Add to cart"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none shadow-xl">
                          Add to cart
                        </span>
                      </button>
                    </div>
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5 bg-gradient-to-b from-gray-800 to-gray-900">
                    {product.category && (
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-600/30">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm mb-1">Price</p>
                        <p className="text-white font-bold text-2xl">
                          Rs. {product.price.toLocaleString('en-PK')}
                        </p>
                      </div>
                      <div className="text-right">
                        {product.description && (
                          <p className="text-gray-400 text-xs line-clamp-2 max-w-[120px]">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </main>
  );
}

// Product Modal Component
function ProductModal({ product, onClose, onAddToCart, favorites, onToggleFavorite }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState({ show: false, x: 0, y: 0 });
  const { showToast } = useToast();

  const handleImageHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomImage({ show: true, x, y });
  };

  const handleImageLeave = () => {
    setZoomImage({ ...zoomImage, show: false });
  };

  const handleImageMove = (e) => {
    if (!zoomImage.show) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomImage({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-gray-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image with Zoom */}
              <div
                className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-gray-900 cursor-zoom-in"
                onMouseMove={handleImageMove}
                onMouseEnter={handleImageHover}
                onMouseLeave={handleImageLeave}
              >
                {product.images[selectedImageIndex] ? (
                  <>
                    <img
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      className={`w-full h-full object-contain transition-transform duration-300 ${
                        zoomImage.show ? 'scale-[2.5]' : 'scale-100'
                      }`}
                      style={{
                        transformOrigin: `${zoomImage.x}% ${zoomImage.y}%`,
                      }}
                    />
                    {zoomImage.show && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute w-40 h-40 border-2 border-white/30 rounded-full"
                          style={{
                            left: `${zoomImage.x}%`,
                            top: `${zoomImage.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                {product.category && (
                  <div className="mb-4">
                    <span className="inline-block px-4 py-2 bg-blue-600/20 text-blue-400 text-sm font-semibold rounded-lg border border-blue-600/30">
                      {product.category.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <span className="text-gray-400 text-sm block mb-2">Price</span>
                    <span className="text-4xl font-bold text-green-400">
                      Rs. {product.price.toLocaleString('en-PK')}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(product._id)}
                    className={`p-2 rounded-full transition-colors ${
                      favorites.includes(product._id)
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-gray-700 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill={favorites.includes(product._id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{product.description}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

