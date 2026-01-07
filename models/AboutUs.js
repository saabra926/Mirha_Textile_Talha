import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  picture: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
});

const reviewSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  review: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const aboutUsSchema = new mongoose.Schema({
  qualitySection: {
    title: {
      type: String,
      default: 'Our Quality Commitment',
    },
    description: {
      type: String,
      default: 'We are committed to providing the highest quality textile products.',
    },
    image: {
      type: String,
      default: '',
    },
  },
  successStorySection: {
    title: {
      type: String,
      default: 'Our Success Story',
    },
    story: {
      type: String,
      default: 'Our journey began with a vision to provide quality textiles.',
    },
    image: {
      type: String,
      default: '',
    },
  },
  teamMembers: {
    type: [teamMemberSchema],
    default: [],
  },
  customerReviews: {
    type: [reviewSchema],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
aboutUsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const AboutUs = mongoose.models.AboutUs || mongoose.model('AboutUs', aboutUsSchema);

export default AboutUs;

