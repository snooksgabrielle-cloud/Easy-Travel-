import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { listProperties, getPropertyById, createBooking, getBookings, getAdminOverview } from './lib/store.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'easy-travel-platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get('/api/properties', async (_req: Request, res: Response) => {
  try {
    const properties = await listProperties();
    res.json({ properties, total: properties.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load properties', error: (error as Error).message });
  }
});

app.get('/api/properties/:id', async (req: Request, res: Response) => {
  try {
    const property = await getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ property });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load property', error: (error as Error).message });
  }
});

app.get('/api/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await getBookings();
    res.json({ bookings, total: bookings.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load bookings', error: (error as Error).message });
  }
});

app.post('/api/bookings', async (req: Request, res: Response) => {
  try {
    const { propertyId, guestName, guestEmail, guestPhone, checkIn, checkOut, adults = 1, children = 0, notes } = req.body ?? {};

    if (!propertyId || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const property = await getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Dates must be valid ISO strings' });
    }
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    const nights = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
    if (nights < 5) {
      return res.status(400).json({ message: 'Minimum stay is 5 nights' });
    }

    const booking = await createBooking({
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      adults,
      children,
      notes,
    });

    res.status(201).json({ booking, message: 'Booking created successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

app.get('/api/admin/overview', async (_req: Request, res: Response) => {
  try {
    const overview = await getAdminOverview();
    res.json({ overview });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate admin overview', error: (error as Error).message });
  }
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error', error: error.message });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Easy Travel Platform API listening on http://0.0.0.0:${port}`);
});
