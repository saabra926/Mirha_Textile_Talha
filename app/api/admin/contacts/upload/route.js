import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Contact from '../../../../../models/Contact';
import jwt from 'jsonwebtoken';
import * as XLSX from 'xlsx';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

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

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    // Process contacts
    const contacts = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const name = row.Name || row.name || row['Full Name'] || row['Full name'] || '';
      const email = row.Email || row.email || row['E-mail'] || row['E-Mail'] || '';

      if (!name || !email) {
        errors.push(`Row ${i + 2}: Missing name or email`);
        continue;
      }

      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${i + 2}: Invalid email format - ${email}`);
        continue;
      }

      // Check if contact already exists
      const existingContact = await Contact.findOne({
        email: email.toLowerCase(),
        addedBy: decoded.userId,
      });

      if (!existingContact) {
        contacts.push({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          addedBy: decoded.userId,
        });
      }
    }

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No new contacts to add. All contacts already exist.', errors },
        { status: 400 }
      );
    }

    // Insert contacts
    const insertedContacts = await Contact.insertMany(contacts, { ordered: false });

    return NextResponse.json(
      {
        message: `Successfully imported ${insertedContacts.length} contacts`,
        count: insertedContacts.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload contacts error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

