import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Category from '../../../../models/Category';

// GET - Fetch all active categories (public)
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });

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

