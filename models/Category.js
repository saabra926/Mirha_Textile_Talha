import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // URL or path to image
    default: '',
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

// Update updatedAt before saving
categorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;

