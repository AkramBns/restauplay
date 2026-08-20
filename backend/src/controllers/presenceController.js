const prisma = require('../config/db');
const { PRESENCE_STATUSES } = require('../utils/constants');

// GET /api/presence?from=2026-07-01&to=2026-07-31&userId=...
// Admin-only endpoint used to populate the presence calendar.
// Optional query param `includeUsers=false` will omit loading the user info
async function listPresence(req, res) {
  const { from, to, userId, includeUsers } = req.query;
  const where = {};
  if (userId) where.userId = userId;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }
  const findOptions = { where, orderBy: { date: 'asc' } };
  const includeUsersFlag = !(includeUsers === 'false' || includeUsers === '0' || includeUsers === 'no');
  if (includeUsersFlag) {
    findOptions.include = { user: { select: { id: true, firstName: true, lastName: true } } };
  }

  const presences = await prisma.presence.findMany(findOptions);
  res.json({ presences });
}

// POST /api/presence (admin only) - create or update a day's presence for a user
async function upsertPresence(req, res) {
  const { userId, date, status, notes } = req.body;
  if (!userId || !date || !status) {
    return res.status(400).json({ error: 'userId, date and status are required' });
  }
  if (!PRESENCE_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${PRESENCE_STATUSES.join(', ')}` });
  }

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const presence = await prisma.presence.upsert({
    where: { userId_date: { userId, date: day } },
    update: { status, notes: notes || null, recordedById: req.user.id },
    create: { userId, date: day, status, notes: notes || null, recordedById: req.user.id },
  });

  res.json({ presence });
}

async function deletePresence(req, res) {
  try {
    await prisma.presence.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Presence record not found' });
  }
}

module.exports = { listPresence, upsertPresence, deletePresence };
