import { NextResponse } from 'next/server';
import { ensureAdminExists } from '../../../lib/ensureAdmin';

/**
 * Initialization endpoint - Ensures admin user exists
 * Call this endpoint once after deployment to initialize admin user
 * GET /api/init
 */
export async function GET() {
  try {
    const result = await ensureAdminExists();

    if (result.created) {
      return NextResponse.json(
        {
          message: 'Admin user created successfully',
          credentials: {
            email: 'admin@gmail.com',
            password: 'admin123@',
          },
          created: true,
        },
        { status: 201 }
      );
    }

    if (result.updated) {
      return NextResponse.json(
        {
          message: 'Admin user updated (role and password reset)',
          credentials: {
            email: 'admin@gmail.com',
            password: 'admin123@',
          },
          updated: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: 'Admin user already exists',
        credentials: {
          email: 'admin@gmail.com',
          password: 'admin123@',
        },
        exists: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to initialize admin user',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

