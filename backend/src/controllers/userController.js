const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { ROLES } = require('../utils/constants');
const { sanitizeUser } = require('./authController');

// GET /api/users  (admin only) - the staff registry list
async function listUsers(req, res) {
  const users = await prisma.user.findMany({ orderBy: { lastName: 'asc' } });
  res.json({ users: users.map(sanitizeUser) });
}

async function getUser(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: sanitizeUser(user) });
}

// POST /api/users (admin only) - create a new staff member
async function createUser(req, res) {
  const { firstName, lastName, email, password, phone, address, birthDate, startWorkDate, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'firstName, lastName, email and password are required' });
  }
  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of ${ROLES.join(', ')}` });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || null,
      address: address || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      startWorkDate: startWorkDate ? new Date(startWorkDate) : null,
      role: role || 'staff',
    },
  });

  res.status(201).json({ user: sanitizeUser(user) });
}

// PUT /api/users/:id (admin only) - edit staff info / role / block / unblock
async function updateUser(req, res) {
  const { firstName, lastName, email, phone, address, birthDate, startWorkDate, role, accountStatus, password } = req.body;

  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of ${ROLES.join(', ')}` });
  }
  if (accountStatus && !['active', 'blocked'].includes(accountStatus)) {
    return res.status(400).json({ error: 'accountStatus must be active or blocked' });
  }

  const data = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (email !== undefined) data.email = email.toLowerCase();
  if (phone !== undefined) data.phone = phone;
  if (address !== undefined) data.address = address;
  if (birthDate !== undefined) data.birthDate = birthDate ? new Date(birthDate) : null;
  if (startWorkDate !== undefined) data.startWorkDate = startWorkDate ? new Date(startWorkDate) : null;
  if (role !== undefined) data.role = role;
  if (accountStatus !== undefined) data.accountStatus = accountStatus;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
}

// DELETE /api/users/:id (admin only)
async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
