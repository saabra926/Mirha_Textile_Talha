import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Contact from '../../../../../models/Contact';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// PUT - Update contact
export async function PUT(request, { params }) {
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

    const { id } = params;
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Find contact
    const contact = await Contact.findOne({
      _id: id,
      addedBy: decoded.userId,
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (email.toLowerCase() !== contact.email) {
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
    }

    // Update contact
    contact.name = name.trim();
    contact.email = email.toLowerCase().trim();
    contact.updatedAt = Date.now();

    await contact.save();

    return NextResponse.json(
      {
        message: 'Contact updated successfully',
        contact: {
          _id: contact._id,
          name: contact.name,
          email: contact.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact
export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Find and delete contact
    const contact = await Contact.findOneAndDelete({
      _id: id,
      addedBy: decoded.userId,
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Contact deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

