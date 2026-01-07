import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  images: {
    type: [String], // Array of image URLs or base64
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;

