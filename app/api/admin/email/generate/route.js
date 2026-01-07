import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

    const { prompt, language } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate email based on language
    let generatedEmail = '';

    if (language === 'roman-urdu') {
      // Roman Urdu email generation
      generatedEmail = generateRomanUrduEmail(prompt);
    } else {
      // English email generation
      generatedEmail = generateEnglishEmail(prompt);
    }

    return NextResponse.json(
      {
        email: generatedEmail,
        language: language,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate email error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateEnglishEmail(prompt) {
  // Simple template-based generation (in production, use OpenAI API)
  const templates = {
    discount: `Dear Valued Customer,

We are excited to offer you a special discount on our premium products!

${prompt}

This offer is valid for a limited time only. Don't miss out on this amazing opportunity!

Best regards,
Mirha Textile Team`,

    service: `Dear Customer,

We are pleased to inform you about our new service offerings.

${prompt}

We look forward to serving you!

Warm regards,
Mirha Textile Team`,

    update: `Dear Customer,

We wanted to keep you informed about an important update.

${prompt}

Thank you for your continued support!

Best regards,
Mirha Textile Team`,
  };

  // Simple keyword matching
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('discount') || lowerPrompt.includes('sale') || lowerPrompt.includes('offer')) {
    return templates.discount.replace('${prompt}', prompt);
  } else if (lowerPrompt.includes('service') || lowerPrompt.includes('new')) {
    return templates.service.replace('${prompt}', prompt);
  } else {
    return templates.update.replace('${prompt}', prompt);
  }
}

function generateRomanUrduEmail(prompt) {
  // Roman Urdu email templates
  const templates = {
    discount: `Aapke naam,

Hum aapko khaas discount offer kar rahe hain!

${prompt}

Ye offer sirf limited time ke liye hai. Is mauqe ko zaroor use karein!

Shukriya,
Mirha Textile Team`,

    service: `Aapke naam,

Hum aapko apni nayi services ke baare mein batana chahte hain.

${prompt}

Aapka intezaar rahega!

Shukriya,
Mirha Textile Team`,

    update: `Aapke naam,

Hum aapko ek important update ke baare mein batana chahte hain.

${prompt}

Aapke support ka shukriya!

Shukriya,
Mirha Textile Team`,
  };

  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('discount') || lowerPrompt.includes('sale') || lowerPrompt.includes('offer')) {
    return templates.discount.replace('${prompt}', prompt);
  } else if (lowerPrompt.includes('service') || lowerPrompt.includes('new')) {
    return templates.service.replace('${prompt}', prompt);
  } else {
    return templates.update.replace('${prompt}', prompt);
  }
}

