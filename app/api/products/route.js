import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - Fetch all products (public)
export async function GET(request) {
  try {
    await connectDB();

    const { category } = request.nextUrl.searchParams;
    
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('category', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { products },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new product (admin only)
export async function POST(request) {
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
    const { name, description, category, price, images } = data;

    // Validation
    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create({
      name: name.trim(),
      description: description?.trim() || '',
      category,
      price: parseFloat(price),
      images: images || [],
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name');

    return NextResponse.json(
      { message: 'Product created successfully', product: populatedProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

