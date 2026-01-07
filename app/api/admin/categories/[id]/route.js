import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Category from '../../../../../models/Category';
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

// PUT - Update category
export async function PUT(request, { params }) {
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

    const { id } = params;
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description') || '';
    const imageFile = formData.get('image');

    // Find category
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if name is being changed and if it's already taken
    if (name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ name: name.trim() });
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Handle image upload
    let imageUrl = category.image; // Keep existing image if no new one
    if (imageFile) {
      // Convert file to base64 for now (not recommended for production)
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${imageFile.type};base64,${base64}`;
    }

    // Update category
    category.name = name.trim();
    category.description = description.trim();
    if (imageUrl) {
      category.image = imageUrl;
    }
    category.updatedAt = Date.now();

    await category.save();

    return NextResponse.json(
      {
        message: 'Category updated successfully',
        category: {
          _id: category._id,
          name: category.name,
          description: category.description,
          image: category.image,
          isActive: category.isActive,
          updatedAt: category.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Find and delete category
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

