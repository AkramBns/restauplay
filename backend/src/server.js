require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const presenceRoutes = require('./routes/presenceRoutes');
const vacationRoutes = require('./routes/vacationRoutes');
const shoppingRoutes = require('./routes/shoppingRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

app.use(cors());
app.use(express.json());
const debugLogger = require('./middleware/debugLogger');
app.use(debugLogger);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/vacations', vacationRoutes);
app.use('/api/shopping-items', shoppingRoutes);
app.use('/api/announcements', announcementRoutes);

// Log unexpected request errors
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.statusCode || 500).json({
    error: 'Internal server error',
  });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
});