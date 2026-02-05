import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '.env.local' });
import { dbService } from '../services/mysqlDbService.js';
import { emailService } from '../services/emailService.js';
import { smsService } from '../services/smsService.js';
import { v4 as uuidv4 } from 'uuid';

// --- Environment Validation ---
const REQUIRED_ENV = ['VITE_DB_HOST', 'VITE_DB_USER', 'VITE_DB_NAME'];
const missingEnv = REQUIRED_ENV.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

const app = express();
const port = 3001;

// --- Security Middleware ---
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors());
app.use(express.json());

// Rate Limiting: 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// --- Error Handling Utility ---
class APIError extends Error {
    constructor(public message: string, public statusCode: number = 500) {
        super(message);
    }
}

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// --- API Router (v1) ---
const v1Router = express.Router();

// GET All
v1Router.get('/:table', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const companyId = req.query.companyId as string;

    const results = await dbService.getAll(table, companyId);
    res.json(results);
}));

// GET By ID
v1Router.get('/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const id = req.params.id as string;
    const companyId = req.query.companyId as string;

    const result = await dbService.getById(table, id, companyId);
    if (!result) {
        throw new APIError('Item not found', 404);
    }
    res.json(result);
}));

// CREATE
v1Router.post('/:table', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const item = req.body;
    const companyId = req.query.companyId as string;

    const result = await dbService.create(table, item, companyId);
    res.status(201).json(result);
}));

// UPDATE
v1Router.put('/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const id = req.params.id as string;
    const updates = req.body;

    const result = await dbService.update(table, id, updates);
    res.json(result);
}));

// DELETE
v1Router.delete('/:table/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
    const table = req.params.table as any;
    const id = req.params.id as string;

    await dbService.delete(table, id);
    res.json({ success: true });
}));

// --- Sync & Queued Data Endpoints ---

// Accept Queued Booking
v1Router.post('/sync/bookings', asyncHandler(async (req: express.Request, res: express.Response) => {
    const booking = req.body;
    const companyId = req.query.companyId as string;

    if (!booking.roomId || !booking.checkIn || !booking.checkOut) {
        throw new APIError('Missing required booking fields', 400);
    }

    // Detect conflicts (double bookings)
    const hasConflict = await dbService.checkConflict(booking.roomId, booking.checkIn, booking.checkOut);
    if (hasConflict) {
        return res.status(409).json({
            error: 'Double booking detected',
            conflict: true,
            message: 'The selected room is already booked for these dates.'
        });
    }

    // Set status to queued if not provided
    if (!booking.status) {
        booking.status = 'queued';
    }

    const result = await dbService.create('bookings', booking, companyId);
    res.status(201).json(result);
}));

// Confirm Queued Booking
v1Router.post('/sync/bookings/:id/confirm', asyncHandler(async (req: express.Request, res: express.Response) => {
    const id = req.params.id as string;

    try {
        const result = await dbService.confirmBooking(id);
        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            booking: result
        });
    } catch (error: any) {
        throw new APIError(error.message, 400);
    }
}));

// Accept Queued Payment
v1Router.post('/sync/payments', asyncHandler(async (req: express.Request, res: express.Response) => {
    const payment = req.body;

    if (!payment.bookingId || !payment.amount) {
        throw new APIError('Missing required payment fields', 400);
    }

    try {
        const result = await dbService.processQueuedPayment(payment);
        res.status(201).json(result);
    } catch (error: any) {
        throw new APIError(error.message, 400);
    }
}));

// --- Email Endpoints ---
v1Router.post('/email/booking-confirmation', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { booking, guest, room, category } = req.body;

  if (!booking || !guest || !room || !category) {
    throw new APIError('Missing required email data', 400);
  }

  try {
    const emailOptions = emailService.generateBookingConfirmationEmail(booking, guest, room, category);
    const success = await emailService.sendEmail(emailOptions);

    if (success) {
      res.json({ success: true, message: 'Confirmation email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send confirmation email' });
    }
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, message: 'Email service error' });
  }
}));

v1Router.post('/email/food-order-confirmation', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { order, guest, room } = req.body;

  if (!order || !guest || !room) {
    throw new APIError('Missing required email data', 400);
  }

  try {
    const emailOptions = emailService.generateFoodOrderConfirmationEmail(order, guest, room);
    const success = await emailService.sendEmail(emailOptions);

    if (success) {
      res.json({ success: true, message: 'Food order confirmation email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send food order confirmation email' });
    }
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, message: 'Email service error' });
  }
}));

// --- SMS Endpoints ---
v1Router.post('/sms/booking-confirmation', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { booking, guest, room, category } = req.body;

  if (!booking || !guest || !room || !category) {
    throw new APIError('Missing required SMS data', 400);
  }

  try {
    const smsOptions = smsService.generateBookingConfirmationSMS(booking, guest, room);
    const success = await smsService.sendSMS(smsOptions);

    if (success) {
      res.json({ success: true, message: 'Booking confirmation SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send booking confirmation SMS' });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ success: false, message: 'SMS service error' });
  }
}));

v1Router.post('/sms/food-order-confirmation', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { order, guest, room } = req.body;

  if (!order || !guest || !room) {
    throw new APIError('Missing required SMS data', 400);
  }

  try {
    const smsOptions = smsService.generateFoodOrderConfirmationSMS(order, guest, room);
    const success = await smsService.sendSMS(smsOptions);

    if (success) {
      res.json({ success: true, message: 'Food order confirmation SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send food order confirmation SMS' });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ success: false, message: 'SMS service error' });
  }
}));

v1Router.post('/sms/room-ready', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { booking, guest, room } = req.body;

  if (!booking || !guest || !room) {
    throw new APIError('Missing required SMS data', 400);
  }

  try {
    const smsOptions = smsService.generateRoomReadySMS(booking, guest, room);
    const success = await smsService.sendSMS(smsOptions);

    if (success) {
      res.json({ success: true, message: 'Room ready SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send room ready SMS' });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ success: false, message: 'SMS service error' });
  }
}));

v1Router.post('/sms/checkout-reminder', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { booking, guest, room } = req.body;

  if (!booking || !guest || !room) {
    throw new APIError('Missing required SMS data', 400);
  }

  try {
    const smsOptions = smsService.generateCheckoutReminderSMS(booking, guest, room);
    const success = await smsService.sendSMS(smsOptions);

    if (success) {
      res.json({ success: true, message: 'Checkout reminder SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send checkout reminder SMS' });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ success: false, message: 'SMS service error' });
  }
}));

// Mount API Versions
app.use('/api/v1', v1Router);
// Maintain backward compatibility for now
app.use('/api', v1Router);

// --- Serve React App (Production only) ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  // Catch-all handler: send back index.html for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// --- Centralized Error Handling Middleware ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Error] ${err.message}`);
    const statusCode = err instanceof APIError ? err.statusCode : 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;

    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start Server
app.listen(port, () => {
    console.log(`✅ API Server running on port ${port}`);
});
