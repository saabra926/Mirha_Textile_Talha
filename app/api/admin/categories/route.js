import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Category from '../../../../models/Category';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - Fetch all categories
export async function GET(request) {
  try {
    await connectDB();

    // Get token from Authorization header
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

    const categories = await Category.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { categories },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    await connectDB();

    // Get token from Authorization header
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

    // Check content type
    const contentType = request.headers.get('content-type');
    let name, description, imageFile, imageBase64;

    if (contentType?.includes('application/json')) {
      // Handle JSON request (for base64 images)
      const data = await request.json();
      name = data.name;
      description = data.description || '';
      imageBase64 = data.image || '';
    } else {
      // Handle FormData request
      const formData = await request.formData();
      name = formData.get('name');
      description = formData.get('description') || '';
      imageFile = formData.get('image');
    }

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // Handle image upload (for now, store as base64 or URL)
    // In production, you should upload to cloud storage (AWS S3, Cloudinary, etc.)
    let imageUrl = '';
    if (imageBase64) {
      // Already base64 from JSON request
      imageUrl = imageBase64;
    } else if (imageFile) {
      // Convert file to base64 for now (not recommended for production)
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${imageFile.type};base64,${base64}`;
    }

    // Create category
    const category = await Category.create({
      name: name.trim(),
      description: description.trim(),
      image: imageUrl,
    });

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category: {
          _id: category._id,
          name: category.name,
          description: category.description,
          image: category.image,
          isActive: category.isActive,
          createdAt: category.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

