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

// POST - Seed sales data (35,00,000 from 2020)
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

    // Check if data already exists - allow reseeding but warn
    const existingCount = await Sales.countDocuments();
    if (existingCount > 0) {
      // Delete existing data to reseed
      await Sales.deleteMany({});
    }

    const categories = ['Chiffon', 'Khaddar', 'Velvet', 'Lawn', 'Linen', 'Silk', 'Viscose', 'Cotton', 'Wool', 'Bridal'];
    const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Online Payment'];
    
    const totalTarget = 3500000; // 35,00,000
    const sales = [];
    let currentTotal = 0;
    
    // Generate sales from 2020 to current year
    const startYear = 2020;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    const years = currentYear - startYear + 1;
    
    // Monthly distribution - some months have higher sales
    const monthlyMultipliers = {
      0: 0.6,   // January - lower
      1: 0.7,   // February - lower
      2: 0.8,   // March - medium
      3: 1.2,   // April - higher (spring)
      4: 1.5,   // May - higher
      5: 1.8,   // June - highest (summer)
      6: 1.6,   // July - high
      7: 1.4,   // August - high
      8: 1.0,   // September - medium
      9: 0.9,   // October - medium
      10: 1.3,  // November - higher (winter prep)
      11: 1.2,  // December - higher (winter)
    };
    
    const totalMultiplier = Object.values(monthlyMultipliers).reduce((a, b) => a + b, 0);
    const avgMonthlyTarget = (totalTarget / years) / 12;
    
    // Calculate how much should be in current month and today
    const currentMonthMultiplier = monthlyMultipliers[currentMonth];
    const currentMonthTarget = avgMonthlyTarget * currentMonthMultiplier;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const avgDailyTarget = currentMonthTarget / daysInCurrentMonth;
    const todayTarget = avgDailyTarget * 1.2; // Ensure today has good amount (20% more than average)
    
    // Track amounts for current month and today
    let currentMonthTotal = 0;
    let todayTotal = 0;
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];
    
    for (let year = startYear; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        // Skip future months in current year
        if (year === currentYear && month > new Date().getMonth()) {
          break;
        }
        
        const multiplier = monthlyMultipliers[month];
        const monthTarget = avgMonthlyTarget * multiplier;
        
        // Generate 15-25 sales per month
        const salesCount = Math.floor(Math.random() * 11) + 15;
        const avgSaleAmount = monthTarget / salesCount;
        
        // Generate days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const isCurrentMonth = year === currentYear && month === currentMonth;
        
        for (let i = 0; i < salesCount && currentTotal < totalTarget; i++) {
          let day;
          // For current month, ensure some sales are today or before today
          if (isCurrentMonth && i < Math.floor(salesCount * (currentDay / daysInMonth))) {
            day = Math.floor(Math.random() * currentDay) + 1;
          } else {
            day = Math.floor(Math.random() * daysInMonth) + 1;
          }
          
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().split('T')[0];
          
          // Vary the amount around the average
          const variation = 0.7 + Math.random() * 0.6; // 70% to 130% of average
          let amount = avgSaleAmount * variation;
          
          // Ensure we don't exceed target
          if (currentTotal + amount > totalTarget) {
            amount = totalTarget - currentTotal;
          }
          
          if (amount > 0) {
            const sale = {
              date,
              amount: Math.round(amount),
              description: `Sale for ${categories[Math.floor(Math.random() * categories.length)]}`,
              category: categories[Math.floor(Math.random() * categories.length)],
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              customerName: `Customer ${Math.floor(Math.random() * 1000) + 1}`,
              invoiceNumber: `INV-${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
            };
            
            sales.push(sale);
            currentTotal += amount;
            
            // Track current month and today totals
            if (year === currentYear && month === currentMonth) {
              currentMonthTotal += amount;
            }
            if (dateStr === todayStr) {
              todayTotal += amount;
            }
          }
        }
      }
    }
    
    // Ensure today has at least 2-4 sales with good amounts
    const todaySalesCount = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.toISOString().split('T')[0] === todayStr;
    }).length;
    
    if (todaySalesCount === 0 || todayTotal < todayTarget * 0.7) {
      // Add 2-4 sales for today
      const salesToAdd = Math.floor(Math.random() * 3) + 2; // 2-4 sales
      const amountPerSale = Math.round(todayTarget / salesToAdd);
      
      for (let i = 0; i < salesToAdd; i++) {
        const todayAmount = Math.round(amountPerSale * (0.8 + Math.random() * 0.4));
        sales.push({
          date: todayDate,
          amount: todayAmount,
          description: `Sale for ${categories[Math.floor(Math.random() * categories.length)]}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          customerName: `Customer ${Math.floor(Math.random() * 1000) + 1}`,
          invoiceNumber: `INV-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(sales.length + 1).padStart(4, '0')}`,
        });
        currentTotal += todayAmount;
        todayTotal += todayAmount;
        currentMonthTotal += todayAmount;
      }
    }
    
    // Ensure current month has good amount (at least 70% of target)
    const currentMonthSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.getFullYear() === currentYear && saleDate.getMonth() === currentMonth;
    });
    const currentMonthActualTotal = currentMonthSales.reduce((sum, s) => sum + s.amount, 0);
    
    if (currentMonthActualTotal < currentMonthTarget * 0.7) {
      // Add more sales to current month
      const remaining = currentMonthTarget * 0.7 - currentMonthActualTotal;
      const additionalSales = Math.floor(Math.random() * 5) + 3; // 3-7 sales
      const amountPerSale = Math.round(remaining / additionalSales);
      
      for (let i = 0; i < additionalSales; i++) {
        const day = Math.floor(Math.random() * currentDay) + 1; // Only past days
        const date = new Date(currentYear, currentMonth, day);
        const amount = Math.round(amountPerSale * (0.8 + Math.random() * 0.4));
        
        sales.push({
          date,
          amount,
          description: `Sale for ${categories[Math.floor(Math.random() * categories.length)]}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          customerName: `Customer ${Math.floor(Math.random() * 1000) + 1}`,
          invoiceNumber: `INV-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(sales.length + 1).padStart(4, '0')}`,
        });
        currentTotal += amount;
        currentMonthTotal += amount;
        
        if (date.toISOString().split('T')[0] === todayStr) {
          todayTotal += amount;
        }
      }
    }
    
    // Add remaining amount if any
    if (currentTotal < totalTarget) {
      const remaining = totalTarget - currentTotal;
      const lastSale = sales[sales.length - 1];
      if (lastSale) {
        lastSale.amount += Math.round(remaining);
        currentTotal = totalTarget;
      }
    }
    
    await Sales.insertMany(sales);
    
    return NextResponse.json({ 
      message: `Sales data seeded successfully`,
      count: sales.length,
      total: currentTotal
    }, { status: 201 });
  } catch (error) {
    console.error('Error seeding sales:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

