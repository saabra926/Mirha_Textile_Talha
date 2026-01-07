import mongoose from 'mongoose';
import crypto from 'crypto';

const smtpConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  host: {
    type: String,
    required: [true, 'SMTP host is required'],
    trim: true,
  },
  port: {
    type: Number,
    required: [true, 'SMTP port is required'],
    default: 587,
  },
  secure: {
    type: Boolean,
    default: false, // true for 465, false for other ports
  },
  auth: {
    user: {
      type: String,
      required: [true, 'SMTP username/email is required'],
      trim: true,
    },
    pass: {
      type: String,
      required: [true, 'SMTP password is required'],
      // Encrypt password before saving
      set: function(value) {
        if (value && !value.startsWith('encrypted:')) {
          const algorithm = 'aes-256-cbc';
          const key = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';
          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv(algorithm, Buffer.from(key.substring(0, 32)), iv);
          let encrypted = cipher.update(value, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          return `encrypted:${iv.toString('hex')}:${encrypted}`;
        }
        return value;
      },
    },
  },
  from: {
    name: {
      type: String,
      default: 'Mirha Textile',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'From email is required'],
      trim: true,
    },
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
smtpConfigSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to decrypt password
smtpConfigSchema.methods.getDecryptedPassword = function() {
  if (!this.auth.pass || !this.auth.pass.startsWith('encrypted:')) {
    return this.auth.pass;
  }
  
  try {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';
    const parts = this.auth.pass.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key.substring(0, 32)), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return this.auth.pass;
  }
};

const SMTPConfig = mongoose.models.SMTPConfig || mongoose.model('SMTPConfig', smtpConfigSchema);

export default SMTPConfig;

