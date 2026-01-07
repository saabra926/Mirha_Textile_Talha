import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    await connectDB();

    // Get token from Authorization header
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'yearly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
    const day = parseInt(searchParams.get('day')) || new Date().getDate();

    let startDateTime, endDateTime;

    // Calculate date range based on filter type
    switch (type) {
      case 'yearly':
        startDateTime = new Date(year, 0, 1);
        endDateTime = new Date(year, 11, 31, 23, 59, 59, 999);
        break;
      case 'monthly':
        startDateTime = new Date(year, month - 1, 1);
        endDateTime = new Date(year, month, 0, 23, 59, 59, 999);
        break;
      case 'daily':
        startDateTime = new Date(year, month - 1, day, 0, 0, 0, 0);
        endDateTime = new Date(year, month - 1, day, 23, 59, 59, 999);
        break;
      case 'hourly':
        startDateTime = new Date(year, month - 1, day, 0, 0, 0, 0);
        endDateTime = new Date(year, month - 1, day, 23, 59, 59, 999);
        break;
      case 'custom':
        if (startDate && endDate) {
          startDateTime = new Date(startDate);
          endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
        } else {
          startDateTime = new Date(year, 0, 1);
          endDateTime = new Date();
        }
        break;
      default:
        startDateTime = new Date(year, 0, 1);
        endDateTime = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // Fetch orders within date range
    const orders = await Order.find({
      createdAt: {
        $gte: startDateTime,
        $lte: endDateTime,
      },
    }).populate('userId', 'firstName lastName email');

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by time period if needed
    let timeSeriesData = [];
    if (type === 'hourly') {
      // Group by hour
      const hourlyData = {};
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = { hour: i, revenue: 0, orders: 0 };
      }
      orders.forEach((order) => {
        const hour = new Date(order.createdAt).getHours();
        hourlyData[hour].revenue += order.totalAmount || 0;
        hourlyData[hour].orders += 1;
      });
      timeSeriesData = Object.values(hourlyData);
    } else if (type === 'daily') {
      // Group by day of month
      const dailyData = {};
      for (let i = 1; i <= 31; i++) {
        dailyData[i] = { day: i, revenue: 0, orders: 0 };
      }
      orders.forEach((order) => {
        const day = new Date(order.createdAt).getDate();
        if (dailyData[day]) {
          dailyData[day].revenue += order.totalAmount || 0;
          dailyData[day].orders += 1;
        }
      });
      timeSeriesData = Object.values(dailyData).filter((d) => d.orders > 0);
    } else if (type === 'monthly') {
      // Group by month
      const monthlyData = {};
      for (let i = 1; i <= 12; i++) {
        monthlyData[i] = { month: i, revenue: 0, orders: 0 };
      }
      orders.forEach((order) => {
        const month = new Date(order.createdAt).getMonth() + 1;
        monthlyData[month].revenue += order.totalAmount || 0;
        monthlyData[month].orders += 1;
      });
      timeSeriesData = Object.values(monthlyData).filter((d) => d.orders > 0);
    }

    return NextResponse.json(
      {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        timeSeriesData,
        orders: orders.map((order) => ({
          id: order._id,
          userId: order.userId,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sales data error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

