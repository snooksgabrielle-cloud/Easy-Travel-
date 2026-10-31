import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultProperties } from '../data/seed.js';
import type { BookingRecord, DatabaseState, PaymentRecord, PropertyRecord } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, '..', 'data', 'db.json');

const emptyState: DatabaseState = {
  properties: defaultProperties,
  bookings: [],
  payments: [],
};

async function ensureStorage() {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  try {
    await fs.access(dbFile);
  } catch {
    await fs.writeFile(dbFile, JSON.stringify(emptyState, null, 2), 'utf8');
  }
}

async function readDb(): Promise<DatabaseState> {
  await ensureStorage();
  const raw = await fs.readFile(dbFile, 'utf8');
  const parsed = JSON.parse(raw) as Partial<DatabaseState>;

  return {
    properties: parsed.properties?.length ? parsed.properties : defaultProperties,
    bookings: parsed.bookings ?? [],
    payments: parsed.payments ?? [],
  };
}

async function writeDb(nextState: DatabaseState): Promise<void> {
  await ensureStorage();
  await fs.writeFile(dbFile, JSON.stringify(nextState, null, 2), 'utf8');
}

export async function listProperties(): Promise<PropertyRecord[]> {
  const db = await readDb();
  return db.properties;
}

export async function getPropertyById(propertyId: string): Promise<PropertyRecord | undefined> {
  const db = await readDb();
  return db.properties.find((property) => property.id === propertyId);
}

export async function getBookings(): Promise<BookingRecord[]> {
  const db = await readDb();
  return db.bookings;
}

export async function getPayments(): Promise<PaymentRecord[]> {
  const db = await readDb();
  return db.payments;
}

export async function createBooking(input: {
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  notes?: string;
}): Promise<BookingRecord> {
  const db = await readDb();
  const property = db.properties.find((entry) => entry.id === input.propertyId);

  if (!property) {
    throw new Error('Property not found');
  }

  const startDate = new Date(input.checkIn);
  const endDate = new Date(input.checkOut);
  const nights = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Check-in and check-out dates must be valid ISO dates');
  }

  if (endDate <= startDate) {
    throw new Error('Check-out must be after check-in');
  }

  if (nights < property.minimumStayDays) {
    throw new Error(`Minimum stay for this property is ${property.minimumStayDays} nights`);
  }

  const overlappingBooking = db.bookings.some((booking) => {
    if (booking.propertyId !== property.id || ['cancelled', 'refunded'].includes(booking.status)) {
      return false;
    }

    const bookingStart = new Date(booking.checkIn);
    const bookingEnd = new Date(booking.checkOut);
    return bookingStart < endDate && startDate < bookingEnd;
  });

  if (overlappingBooking) {
    throw new Error('This property is unavailable for the selected date range');
  }

  const booking: BookingRecord = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    propertyId: property.id,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    status: 'pending',
    notes: input.notes,
    totalNights: nights,
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(booking);
  await writeDb(db);

  return booking;
}

export async function getAdminOverview() {
  const db = await readDb();

  const totalRevenue = db.payments
    .filter((payment) => payment.status === 'succeeded')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    totalProperties: db.properties.length,
    totalBookings: db.bookings.length,
    activeBookings: db.bookings.filter((booking) => !['cancelled', 'refunded', 'completed'].includes(booking.status)).length,
    confirmedBookings: db.bookings.filter((booking) => booking.status === 'confirmed').length,
    pendingBookings: db.bookings.filter((booking) => booking.status === 'pending').length,
    totalRevenue,
  };
}

export async function listAvailableProperties(dateFrom?: string, dateTo?: string) {
  const db = await readDb();

  if (!dateFrom || !dateTo) {
    return db.properties;
  }

  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  return db.properties.filter((property) => {
    const overlap = db.bookings.some((booking) => {
      if (booking.propertyId !== property.id || ['cancelled', 'refunded'].includes(booking.status)) {
        return false;
      }
      const bookingStart = new Date(booking.checkIn);
      const bookingEnd = new Date(booking.checkOut);
      return bookingStart < end && start < bookingEnd;
    });

    return !overlap;
  });
}
