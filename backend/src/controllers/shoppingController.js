const prisma = require('../config/db');
const { SHOPPING_STATUSES, canManageAllShoppingItems } = require('../utils/constants');

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// GET /api/shopping-items?view=today|overdue|upcoming|all&status=pending&date=YYYY-MM-DD
//
// Default ("today"): items planned for today, PLUS any not-completed items
// planned in the past (overdue), so nothing falls through the cracks.
async function listShoppingItems(req, res) {
  const { view = 'today', status, date } = req.query;
  const referenceDate = date ? new Date(date) : new Date();
  const todayStart = startOfDay(referenceDate);
  const todayEnd = endOfDay(referenceDate);

  let where = {};

  if (view === 'today') {
    where = {
      OR: [
        { plannedOn: { gte: todayStart, lte: todayEnd } },
        { plannedOn: { lt: todayStart }, status: { notIn: ['completed', 'cancelled'] } },
      ],
    };
  } else if (view === 'overdue') {
    where = { plannedOn: { lt: todayStart }, status: { notIn: ['completed', 'cancelled'] } };
  } else if (view === 'upcoming') {
    where = { plannedOn: { gt: todayEnd } };
  } else if (view === 'all') {
    where = {};
  }

  if (status) {
    if (!SHOPPING_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${SHOPPING_STATUSES.join(', ')}` });
    }
    where.status = status;
  }

  const items = await prisma.shoppingItem.findMany({
    where,
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      updatedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ plannedOn: 'asc' }, { createdAt: 'asc' }],
  });

  res.json({ items });
}

// POST /api/shopping-items - any authenticated user (staff/buyer/admin)
async function createShoppingItem(req, res) {
  const { name, description, category, quantity, unit, price, plannedOn } = req.body;

  if (!name || quantity === undefined || !unit || !plannedOn) {
    return res.status(400).json({ error: 'name, quantity, unit and plannedOn are required' });
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'quantity must be a positive number' });
  }

  const item = await prisma.shoppingItem.create({
    data: {
      name,
      description: description || null,
      category: category || null,
      quantity,
      unit,
      price: price ?? null,
      plannedOn: new Date(plannedOn),
      status: 'pending',
      createdById: req.user.id,
      updatedById: req.user.id,
    },
  });

  res.status(201).json({ item });
}

// PUT /api/shopping-items/:id
//
// Permission rules:
// - staff: may edit ONLY items they created, and may NEVER set status to "completed"
// - buyer/admin: may edit ANY item, including setting status to "completed"
async function updateShoppingItem(req, res) {
  const existing = await prisma.shoppingItem.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Shopping item not found' });

  const isPrivileged = canManageAllShoppingItems(req.user.role); // buyer or admin
  const isOwner = existing.createdById === req.user.id;

  if (!isPrivileged && !isOwner) {
    return res.status(403).json({ error: 'You can only edit shopping items you created' });
  }

  const { name, description, category, quantity, unit, price, plannedOn, status } = req.body;

  if (status !== undefined) {
    if (!SHOPPING_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${SHOPPING_STATUSES.join(', ')}` });
    }
    if ((status === 'completed' || status === 'in_progress') && !isPrivileged) {
      return res.status(403).json({ error: 'Only a buyer or administrator can start shopping or complete an item' });
    }
  }

  const data = { updatedById: req.user.id };
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (category !== undefined) data.category = category;
  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }
    data.quantity = quantity;
  }
  if (unit !== undefined) data.unit = unit;
  if (price !== undefined) data.price = price;
  if (plannedOn !== undefined) data.plannedOn = new Date(plannedOn);
  if (status !== undefined) data.status = status;

  const item = await prisma.shoppingItem.update({ where: { id: req.params.id }, data });
  res.json({ item });
}

// DELETE /api/shopping-items/:id - owner (if not yet completed) or buyer/admin
async function deleteShoppingItem(req, res) {
  const existing = await prisma.shoppingItem.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Shopping item not found' });

  const isPrivileged = canManageAllShoppingItems(req.user.role);
  const isOwner = existing.createdById === req.user.id;

  if (!isPrivileged && !isOwner) {
    return res.status(403).json({ error: 'You can only delete shopping items you created' });
  }

  await prisma.shoppingItem.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

module.exports = { listShoppingItems, createShoppingItem, updateShoppingItem, deleteShoppingItem };
