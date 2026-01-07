import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Sales from '../../../../models/Sales';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// PUT - Update sale
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();
    const { date, amount, description, category, paymentMethod, customerName, invoiceNumber } = data;

    const sale = await Sales.findByIdAndUpdate(
      id,
      {
        date: date ? new Date(date) : undefined,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description,
        category,
        paymentMethod,
        customerName,
        invoiceNumber,
      },
      { new: true, runValidators: true }
    );

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Sale updated successfully', sale }, { status: 200 });
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete sale
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = params;
    const sale = await Sales.findByIdAndDelete(id);

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Sale deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

