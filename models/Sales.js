import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  description: { 
    type: String, 
    trim: true,
    default: '' 
  },
  category: {
    type: String,
    enum: ['Chiffon', 'Khaddar', 'Velvet', 'Lawn', 'Linen', 'Silk', 'Viscose', 'Cotton', 'Wool', 'Bridal', 'Other'],
    default: 'Other'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Online Payment', 'Other'],
    default: 'Cash'
  },
  customerName: {
    type: String,
    trim: true,
    default: ''
  },
  invoiceNumber: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Index for efficient queries
salesSchema.index({ date: 1 });
salesSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
salesSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Sales = mongoose.models.Sales || mongoose.model('Sales', salesSchema);

export default Sales;

