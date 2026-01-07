import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Contact from '../../../../../models/Contact';
import SMTPConfig from '../../../../../models/SMTPConfig';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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

    const { contacts, subject, body, language } = await request.json();

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts selected' },
        { status: 400 }
      );
    }

    if (!subject || !body) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Get SMTP configuration
    const smtpConfig = await SMTPConfig.findOne({ userId: decoded.userId, isActive: true });

    if (!smtpConfig) {
      return NextResponse.json(
        { error: 'SMTP configuration not found. Please configure SMTP settings first.' },
        { status: 400 }
      );
    }

    // Get contact details
    const contactList = await Contact.find({
      _id: { $in: contacts },
      addedBy: decoded.userId,
    });

    if (contactList.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts found' },
        { status: 400 }
      );
    }

    // Create nodemailer transporter
    const decryptedPassword = smtpConfig.getDecryptedPassword();
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: decryptedPassword,
      },
    });

    // Send emails
    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const contact of contactList) {
      try {
        await transporter.sendMail({
          from: `"${smtpConfig.from.name}" <${smtpConfig.from.email}>`,
          to: contact.email,
          subject: subject,
          html: body.replace(/\n/g, '<br>'),
        });

        sentCount++;
        results.push({ contact: contact.email, status: 'sent' });
      } catch (error) {
        failedCount++;
        results.push({ contact: contact.email, status: 'failed', error: error.message });
      }
    }

    return NextResponse.json(
      {
        message: `Emails sent: ${sentCount} successful, ${failedCount} failed`,
        sent: sentCount,
        failed: failedCount,
        results: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

