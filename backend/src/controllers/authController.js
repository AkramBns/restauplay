const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { signToken } = require('../utils/jwt');

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.accountStatus === 'blocked') {
    return res.status(403).json({ error: 'Your account has been blocked. Contact your administrator.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ token, user: sanitizeUser(user) });
}

async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = { login, me, sanitizeUser };
