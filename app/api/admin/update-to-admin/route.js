import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();
    const adminEmail = email || 'admin@gmail.com';

    // Find user by email
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    return NextResponse.json(
      {
        message: 'User role updated to admin successfully',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user to admin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

