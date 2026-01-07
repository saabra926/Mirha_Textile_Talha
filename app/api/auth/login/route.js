import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import { ensureAdminExists } from '../../../../lib/ensureAdmin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    console.log('=== LOGIN ATTEMPT START ===');
    await connectDB();
    console.log('✅ Database connected');

    // Ensure admin user exists (this is idempotent - safe to call multiple times)
    await ensureAdminExists();
    console.log('✅ Admin user verified/created');

    const { email, password } = await request.json();
    console.log('📧 Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('🔍 User search result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      // Check if any users exist in database
      const userCount = await User.countDocuments();
      console.log('📊 Total users in database:', userCount);
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('👤 Found user:', {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName
    });

    // Check password
    console.log('🔐 Checking password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: userResponse,
        token
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

