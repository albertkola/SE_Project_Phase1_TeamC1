const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const tripsRoutes = require('./routes/trips.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const usersRoutes = require('./routes/users.routes');
const adminRoutes = require('./routes/admin.routes');
const autoComplete = require('./utils/autoComplete');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', service: 'hopin-backend', time: new Date().toISOString() },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/admin', adminRoutes);

autoComplete.start();
// app.use('/api/bookings', require('./routes/bookings.routes'));
// app.use('/api/ratings', require('./routes/ratings.routes'));
// app.use('/api/notifications', require('./routes/notifications.routes'));
// app.use('/api/admin', require('./routes/admin.routes'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
