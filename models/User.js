import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  name: {
    type: String,
    required: false, // Optional - will be auto-generated from firstName + lastName
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
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

// Create full name from firstName and lastName before saving
userSchema.pre('save', function (next) {
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  // Ensure name is set even if validation happens
  if (!this.name && this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

// Also set name before validation
userSchema.pre('validate', function (next) {
  if (this.firstName && this.lastName && !this.name) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

