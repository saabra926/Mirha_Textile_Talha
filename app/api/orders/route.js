import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Order from '../../../models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - Fetch orders with filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(100);

    // Get counts by status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      all: await Order.countDocuments(),
      pending: 0,
      confirmed: 0,
      processing: 0,
      dispatched: 0,
      in_transit: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      if (counts.hasOwnProperty(item._id)) {
        counts[item._id] = item.count;
      }
    });

    return NextResponse.json({ 
      orders, 
      counts,
      total: orders.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new order (admin only)
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
    const { customerName, customerEmail, customerPhone, items, totalAmount, paymentMethod, shippingAddress, notes } = data;

    if (!customerName || !customerEmail || !items || items.length === 0 || !totalAmount) {
      return NextResponse.json({ error: 'Customer name, email, items, and total amount are required' }, { status: 400 });
    }

    // Generate unique order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(6, '0')}`;

    const order = await Order.create({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      items,
      totalAmount: parseFloat(totalAmount),
      paymentMethod: paymentMethod || 'Cash',
      shippingAddress: shippingAddress || {},
      notes: notes || '',
    });

    return NextResponse.json({ message: 'Order created successfully', order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

