import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// POST - Seed orders data
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

    // Check if data already exists - allow reseeding
    const existingCount = await Order.countDocuments();
    if (existingCount > 0) {
      await Order.deleteMany({});
    }

    const categories = ['Chiffon', 'Khaddar', 'Velvet', 'Lawn', 'Linen', 'Silk', 'Viscose', 'Cotton', 'Wool', 'Bridal'];
    const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Online Payment', 'Other'];
    const validStatuses = ['pending', 'confirmed', 'processing', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled'];
    const cities = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Multan', 'Rawalpindi', 'Gujranwala', 'Peshawar'];
    
    const orders = [];
    const now = new Date();
    
    // Generate 50-80 orders with different statuses
    const orderCount = Math.floor(Math.random() * 31) + 50; // 50-80 orders
    
    for (let i = 0; i < orderCount; i++) {
      // Random date in last 3 months
      const daysAgo = Math.floor(Math.random() * 90);
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      // Select status with weighted distribution (more recent orders are more likely to be active)
      let status;
      const statusRand = Math.random();
      if (daysAgo < 7) {
        // Recent orders - more likely to be active
        if (statusRand < 0.2) status = 'pending';
        else if (statusRand < 0.4) status = 'confirmed';
        else if (statusRand < 0.6) status = 'processing';
        else if (statusRand < 0.75) status = 'dispatched';
        else if (statusRand < 0.85) status = 'in_transit';
        else if (statusRand < 0.95) status = 'delivered';
        else status = 'completed';
      } else if (daysAgo < 30) {
        // Last month - mix of active and completed
        if (statusRand < 0.1) status = 'processing';
        else if (statusRand < 0.2) status = 'dispatched';
        else if (statusRand < 0.3) status = 'in_transit';
        else if (statusRand < 0.6) status = 'delivered';
        else status = 'completed';
      } else {
        // Older orders - mostly completed
        if (statusRand < 0.1) status = 'delivered';
        else status = 'completed';
      }
      
      // Validate status is in valid list
      if (!validStatuses.includes(status)) {
        status = 'pending';
      }
      
      // Generate items (1-4 items per order)
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let totalAmount = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
        const price = Math.floor(Math.random() * 5000) + 1000; // Rs. 1000-6000
        const itemTotal = price * quantity;
        
        items.push({
          productName: `${category} Fabric`,
          category,
          quantity,
          price,
          total: itemTotal,
        });
        
        totalAmount += itemTotal;
      }
      
      // Set dates based on status
      let dispatchedDate, deliveredDate, completedDate;
      if (['dispatched', 'in_transit', 'delivered', 'completed'].includes(status)) {
        dispatchedDate = new Date(orderDate);
        dispatchedDate.setDate(dispatchedDate.getDate() + Math.floor(Math.random() * 3) + 1);
      }
      if (['delivered', 'completed'].includes(status)) {
        deliveredDate = new Date(dispatchedDate || orderDate);
        deliveredDate.setDate(deliveredDate.getDate() + Math.floor(Math.random() * 5) + 2);
      }
      if (status === 'completed') {
        completedDate = new Date(deliveredDate || orderDate);
        completedDate.setDate(completedDate.getDate() + 1);
      }
      
      const customerName = `Customer ${Math.floor(Math.random() * 1000) + 1}`;
      const customerEmail = `customer${i + 1}@example.com`;
      
      // Ensure paymentMethod matches enum exactly
      let paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      // Validate paymentMethod is in valid list
      const validPaymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Online Payment', 'Other'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        paymentMethod = 'Cash'; // Default to Cash if invalid
      }
      
      // Validate status is in valid list (validStatuses is already declared above)
      if (!validStatuses.includes(status)) {
        status = 'pending'; // Default to pending if invalid
      }
      
      orders.push({
        orderNumber: `ORD-${orderDate.getFullYear()}-${String(i + 1).padStart(6, '0')}`,
        customerName,
        customerEmail,
        customerPhone: `03${Math.floor(Math.random() * 90000000) + 10000000}`,
        items,
        totalAmount,
        status,
        paymentStatus: status === 'completed' ? 'paid' : status === 'cancelled' ? 'refunded' : Math.random() > 0.3 ? 'paid' : 'pending',
        paymentMethod,
        shippingAddress: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: cities[Math.floor(Math.random() * cities.length)],
          state: 'Punjab',
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'Pakistan',
        },
        notes: Math.random() > 0.7 ? 'Handle with care' : '',
        orderDate,
        dispatchedDate: dispatchedDate || undefined,
        deliveredDate: deliveredDate || undefined,
        completedDate: completedDate || undefined,
      });
    }
    
    await Order.insertMany(orders);
    
    return NextResponse.json({ 
      message: `Orders seeded successfully`,
      count: orders.length,
    }, { status: 201 });
  } catch (error) {
    console.error('Error seeding orders:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

