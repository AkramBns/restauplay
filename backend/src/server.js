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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/vacations', vacationRoutes);
app.use('/api/shopping-items', shoppingRoutes);
app.use('/api/announcements', announcementRoutes);

// Central error handler (catches anything thrown/rejected in controllers)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
