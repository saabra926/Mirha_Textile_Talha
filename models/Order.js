import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  customerPhone: {
    type: String,
    trim: true,
    default: '',
  },
  items: [{
    productName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending',
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['Cash', 'Card', 'Bank Transfer', 'Online Payment', 'Other'],
      message: '{VALUE} is not a valid payment method'
    },
    default: 'Cash',
  },
  shippingAddress: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    zipCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'Pakistan' },
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  dispatchedDate: {
    type: Date,
  },
  deliveredDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
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

// Indexes for efficient queries
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ customerEmail: 1 });

// Update the updatedAt field before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  // Auto-update status dates
  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'dispatched' && !this.dispatchedDate) {
      this.dispatchedDate = now;
    }
    if (this.status === 'delivered' && !this.deliveredDate) {
      this.deliveredDate = now;
    }
    if (this.status === 'completed' && !this.completedDate) {
      this.completedDate = now;
    }
  }
  
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
