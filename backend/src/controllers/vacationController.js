const prisma = require('../config/db');
const { VACATION_TYPES, VACATION_STATUSES } = require('../utils/constants');

// GET /api/vacations?from=...&to=...&userId=...
// Used by the presence calendar to draw the vacation "bars".
async function listVacations(req, res) {
  const { from, to, userId } = req.query;
  const where = {};
  if (userId) where.userId = userId;
  if (from || to) {
    where.AND = [];
    if (to) where.AND.push({ startDate: { lte: new Date(to) } });
    if (from) where.AND.push({ endDate: { gte: new Date(from) } });
  }

  const vacations = await prisma.vacation.findMany({
    where,
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { startDate: 'asc' },
  });
  res.json({ vacations });
}

async function createVacation(req, res) {
  const { userId, startDate, endDate, type, status, notes } = req.body;
  if (!userId || !startDate || !endDate) {
    return res.status(400).json({ error: 'userId, startDate and endDate are required' });
  }
  if (type && !VACATION_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of ${VACATION_TYPES.join(', ')}` });
  }
  if (status && !VACATION_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VACATION_STATUSES.join(', ')}` });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'endDate cannot be before startDate' });
  }

  const vacation = await prisma.vacation.create({
    data: {
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type: type || 'vacation',
      status: status || 'approved',
      notes: notes || null,
      recordedById: req.user.id,
    },
  });
  res.status(201).json({ vacation });
}

async function updateVacation(req, res) {
  const { startDate, endDate, type, status, notes } = req.body;
  const data = {};
  if (startDate !== undefined) data.startDate = new Date(startDate);
  if (endDate !== undefined) data.endDate = new Date(endDate);
  if (type !== undefined) data.type = type;
  if (status !== undefined) data.status = status;
  if (notes !== undefined) data.notes = notes;

  try {
    const vacation = await prisma.vacation.update({ where: { id: req.params.id }, data });
    res.json({ vacation });
  } catch (err) {
    res.status(404).json({ error: 'Vacation record not found' });
  }
}

async function deleteVacation(req, res) {
  try {
    await prisma.vacation.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Vacation record not found' });
  }
}

module.exports = { listVacations, createVacation, updateVacation, deleteVacation };
