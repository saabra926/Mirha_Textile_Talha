import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { firstName, lastName, email, password, role } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Password strength validation - only number and special character required
    const passwordRegex = /^(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters long and contain at least one number and one special character (@$!%*?&)'
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user (only allow customer role for signup, admin must be created manually)
    const userRole = role === 'admin' ? 'customer' : (role || 'customer');
    
    // Create full name from firstName and lastName
    const fullName = `${firstName} ${lastName}`.trim();
    
    const user = await User.create({
      firstName,
      lastName,
      name: fullName,
      email,
      password,
      role: userRole,
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userResponse
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

