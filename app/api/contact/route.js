import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import ContactInquiry from '../../../models/ContactInquiry';

// POST - Submit contact form
export async function POST(request) {
  try {
    await connectDB();

    const { firstName, lastName, email, subject, message } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Create contact inquiry
    const inquiry = await ContactInquiry.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json(
      {
        message: 'Thank you for contacting us! We will get back to you soon.',
        inquiry: {
          id: inquiry._id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

