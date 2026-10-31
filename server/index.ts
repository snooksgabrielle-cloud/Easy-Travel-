import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createBooking, getAdminOverview, getBookings, getPropertyById, listAvailableProperties, listProperties } from './lib/store.js';

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

app.get('/api/properties', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const properties = await listAvailableProperties(
      typeof dateFrom === 'string' ? dateFrom : undefined,
      typeof dateTo === 'string' ? dateTo : undefined,
    );

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

    return res.json({ property });
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
    const message = (error as Error).message;
    res.status(400).json({ message });
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

app.get('/api/integrations/status', async (_req: Request, res: Response) => {
  res.json({
    integrations: {
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
      aweber: Boolean(process.env.AWEBER_API_KEY),
      acuity: Boolean(process.env.ACUITY_API_KEY),
      gmailSMTP: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      googleMaps: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    },
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error', error: error.message });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Easy Travel Platform API listening on http://0.0.0.0:${port}`);
});
