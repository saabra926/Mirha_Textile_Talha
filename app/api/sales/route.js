import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Sales from '../../../models/Sales';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - Fetch sales with filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy'); // 'day', 'month', 'year'

    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sales = await Sales.find(query).sort({ date: -1 });

    // Group sales if requested
    if (groupBy) {
      const grouped = {};
      
      sales.forEach((sale) => {
        const date = new Date(sale.date);
        let key;
        
        if (groupBy === 'year') {
          key = date.getFullYear().toString();
        } else if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (groupBy === 'day') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
        
        if (!grouped[key]) {
          grouped[key] = { date: key, total: 0, count: 0 };
        }
        grouped[key].total += sale.amount;
        grouped[key].count += 1;
      });
      
      return NextResponse.json({ 
        sales: Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)),
        total: sales.reduce((sum, sale) => sum + sale.amount, 0)
      }, { status: 200 });
    }

    const total = sales.reduce((sum, sale) => sum + sale.amount, 0);

    return NextResponse.json({ 
      sales, 
      total,
      count: sales.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new sale (admin only)
export async function POST(request) {
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

    const data = await request.json();
    const { date, amount, description, category, paymentMethod, customerName, invoiceNumber } = data;

    if (!date || amount === undefined) {
      return NextResponse.json({ error: 'Date and amount are required' }, { status: 400 });
    }

    const sale = await Sales.create({
      date: new Date(date),
      amount: parseFloat(amount),
      description: description || '',
      category: category || 'Other',
      paymentMethod: paymentMethod || 'Cash',
      customerName: customerName || '',
      invoiceNumber: invoiceNumber || '',
    });

    return NextResponse.json({ message: 'Sale added successfully', sale }, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

