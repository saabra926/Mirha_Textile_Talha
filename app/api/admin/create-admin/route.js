import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123@';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        // Also update password if needed
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminPassword, salt);
        await existingAdmin.save();
        return NextResponse.json(
          { 
            message: 'Updated existing user to admin role',
            user: {
              id: existingAdmin._id,
              firstName: existingAdmin.firstName,
              lastName: existingAdmin.lastName,
              email: existingAdmin.email,
              role: existingAdmin.role,
            }
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { 
          message: 'Admin user already exists',
          user: {
            id: existingAdmin._id,
            firstName: existingAdmin.firstName,
            lastName: existingAdmin.lastName,
            email: existingAdmin.email,
            role: existingAdmin.role,
          }
        },
        { status: 200 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user (bypass normal validation by setting password directly)
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    // Remove password from response
    const adminResponse = {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    return NextResponse.json(
      {
        message: 'Admin user created successfully',
        user: adminResponse,
        credentials: {
          email: adminEmail,
          password: adminPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

