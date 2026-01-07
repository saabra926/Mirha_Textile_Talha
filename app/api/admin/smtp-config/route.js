import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import SMTPConfig from '../../../../models/SMTPConfig';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - Fetch SMTP config
export async function GET(request) {
  try {
    await connectDB();

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

    const config = await SMTPConfig.findOne({ userId: decoded.userId });

    if (!config) {
      return NextResponse.json(
        { config: null },
        { status: 200 }
      );
    }

    // Don't send password in response
    const configResponse = {
      _id: config._id,
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
      },
      from: config.from,
      isActive: config.isActive,
    };

    return NextResponse.json(
      { config: configResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch SMTP config error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create SMTP config
export async function POST(request) {
  try {
    await connectDB();

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

    const { host, port, secure, user, pass, fromName, fromEmail } = await request.json();

    if (!host || !port || !user || !pass || !fromEmail) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if config already exists
    const existingConfig = await SMTPConfig.findOne({ userId: decoded.userId });
    if (existingConfig) {
      return NextResponse.json(
        { error: 'SMTP configuration already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const config = await SMTPConfig.create({
      userId: decoded.userId,
      host: host.trim(),
      port: parseInt(port),
      secure: secure || false,
      auth: {
        user: user.trim(),
        pass: pass,
      },
      from: {
        name: fromName || 'Mirha Textile',
        email: fromEmail.trim(),
      },
    });

    return NextResponse.json(
      {
        message: 'SMTP configuration saved successfully',
        config: {
          _id: config._id,
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: config.auth.user,
          },
          from: config.from,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create SMTP config error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update SMTP config
export async function PUT(request) {
  try {
    await connectDB();

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

    const { host, port, secure, user, pass, fromName, fromEmail } = await request.json();

    let config = await SMTPConfig.findOne({ userId: decoded.userId });

    if (!config) {
      // Create if doesn't exist
      if (!host || !port || !user || !pass || !fromEmail) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
        );
      }

      config = await SMTPConfig.create({
        userId: decoded.userId,
        host: host.trim(),
        port: parseInt(port),
        secure: secure || false,
        auth: {
          user: user.trim(),
          pass: pass,
        },
        from: {
          name: fromName || 'Mirha Textile',
          email: fromEmail.trim(),
        },
      });
    } else {
      // Update existing
      config.host = host.trim();
      config.port = parseInt(port);
      config.secure = secure || false;
      config.auth.user = user.trim();
      if (pass) {
        config.auth.pass = pass;
      }
      config.from.name = fromName || 'Mirha Textile';
      config.from.email = fromEmail.trim();
      config.updatedAt = Date.now();

      await config.save();
    }

    return NextResponse.json(
      {
        message: 'SMTP configuration updated successfully',
        config: {
          _id: config._id,
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: config.auth.user,
          },
          from: config.from,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update SMTP config error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

