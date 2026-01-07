import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import AboutUs from '../../../models/AboutUs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - Fetch About Us content (public)
export async function GET() {
  try {
    await connectDB();

    let aboutUs = await AboutUs.findOne({});

    // If no content exists, create default content
    if (!aboutUs) {
      aboutUs = await AboutUs.create({
        qualitySection: {
          title: 'Our Quality Commitment',
          description: 'At Mirha Textile, we are committed to providing the highest quality textile products. Our fabrics are carefully selected and crafted to meet the highest standards of excellence. We source only the finest materials and employ skilled artisans to create products that stand the test of time.',
        },
        successStorySection: {
          title: 'Our Journey',
          story: 'Mirha Textile was founded in 1978 with a vision to provide premium quality textiles to customers worldwide. What started as a small family business has grown into a trusted name in the textile industry. Our commitment to quality, innovation, and customer satisfaction has been the cornerstone of our success. Over the years, we have expanded our product range while maintaining our core values of excellence and integrity.',
        },
        teamMembers: [],
        customerReviews: [],
      });
    }

    return NextResponse.json(
      { aboutUs },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch About Us error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update About Us content (admin only)
export async function PUT(request) {
  try {
    await connectDB();

    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Find existing or create new
    let aboutUs = await AboutUs.findOne({});
    
    if (!aboutUs) {
      aboutUs = await AboutUs.create({});
    }

    // Update fields
    if (data.qualitySection) {
      aboutUs.qualitySection = {
        ...aboutUs.qualitySection,
        ...data.qualitySection,
      };
    }

    if (data.successStorySection) {
      aboutUs.successStorySection = {
        ...aboutUs.successStorySection,
        ...data.successStorySection,
      };
    }

    if (data.teamMembers !== undefined) {
      aboutUs.teamMembers = data.teamMembers;
    }

    if (data.customerReviews !== undefined) {
      aboutUs.customerReviews = data.customerReviews;
    }

    await aboutUs.save();

    return NextResponse.json(
      { message: 'About Us content updated successfully', aboutUs },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update About Us error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

