import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Contact from '../../../../models/Contact';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - Fetch all contacts
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

    const contacts = await Contact.find({ addedBy: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      { contacts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch contacts error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new contact
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

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      email: email.toLowerCase(),
      addedBy: decoded.userId,
    });

    if (existingContact) {
      return NextResponse.json(
        { error: 'Contact with this email already exists' },
        { status: 400 }
      );
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      addedBy: decoded.userId,
    });

    return NextResponse.json(
      {
        message: 'Contact added successfully',
        contact: {
          _id: contact._id,
          name: contact.name,
          email: contact.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add contact error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

