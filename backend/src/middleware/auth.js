const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing authentication token' });

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    if (user.accountStatus === 'blocked') {
      return res.status(403).json({ error: 'Account is blocked' });
    }

    req.user = user; // full user record (minus we strip password below when returning)
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
