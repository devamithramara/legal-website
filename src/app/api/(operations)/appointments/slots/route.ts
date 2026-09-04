import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Standard court holidays (MM-DD format)
const COURT_HOLIDAYS = [
  '01-26', // Republic Day
  '08-15', // Independence Day
  '10-02', // Gandhi Jayanti
  '12-25', // Christmas
  '05-01', // Maharashtra Day / May Day
  '11-01', // Kannada Rajyotsava (or Diwali period)
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({ error: 'Date parameter is required.' }, { status: 400 });
    }

    // Parse YYYY-MM-DD parts directly — avoids UTC/local offset confusion
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-indexed
    const day = parseInt(dayStr, 10);

    // Build a UTC date object for this calendar date
    const selectedDateUTC = new Date(Date.UTC(year, month - 1, day));

    // Check if Sunday (getUTCDay === 0)
    if (selectedDateUTC.getUTCDay() === 0) {
      return NextResponse.json({ slots: [], message: 'Sundays are blocked for consultations.' });
    }

    // Check if Court Holiday using the passed date parts directly
    const mmdd = `${monthStr}-${dayStr}`;

    if (COURT_HOLIDAYS.includes(mmdd)) {
      return NextResponse.json({ slots: [], message: 'Court holiday: Chambers are closed.' });
    }

    // Standard consultation slots
    const standardSlots = [
      '04:00 PM',
      '04:30 PM',
      '05:00 PM',
      '05:30 PM',
      '06:00 PM',
      '06:30 PM',
      '07:00 PM',
      '07:30 PM',
    ];

    // Query appointments for this date using UTC boundaries
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay   = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        timeSlot: true,
      },
    });

    // Map through standard slots and calculate remaining capacity
    // Suppose maximum capacity per slot is 3 consultations
    const maxCapacity = 3;
    const slotsData = standardSlots.map((slot) => {
      const bookedCount = appointments.filter((a) => a.timeSlot === slot).length;
      const capacityLeft = Math.max(0, maxCapacity - bookedCount);
      return {
        slot,
        capacityLeft,
        isAvailable: capacityLeft > 0,
      };
    });

    return NextResponse.json({ slots: slotsData });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
