const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'change-this-secret';
const JWT_EXPIRES_IN = '15m';

// simple in-memory "db"
const users = [
  { id: 1, email: 'user@example.com', passwordHash: bcrypt.hashSync('password', 8) },
];
let transactions = [
  { id: 1, name: 'Milk', description: '1L', state: 'pending' },
];

function generateTokens(user) {
  const accessToken = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).send('Invalid credentials');
  if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).send('Invalid credentials');

  const tokens = generateTokens(user);
  res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user.id, email: user.email } });
});

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).send('Missing token');

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const userId = payload.sub;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(401).send('Invalid token');

    const tokens = generateTokens(user);
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (e) {
    return res.status(401).send('Invalid token');
  }
});

app.post('/auth/logout', (req, res) => {
  // For stateless JWT, logout on client by deleting tokens.
  res.sendStatus(204);
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Missing auth');
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).send('Invalid token');
  }
}

app.get('/transactions', requireAuth, (req, res) => {
  res.json(transactions);
});

app.post('/transactions', requireAuth, (req, res) => {
  const nextId = transactions.length ? transactions[transactions.length - 1].id + 1 : 1;
  const item = { id: nextId, ...req.body };
  transactions.push(item);
  res.status(201).json(item);
});

app.put('/transactions/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).send('Not found');
  transactions[idx] = { ...transactions[idx], ...req.body };
  res.json(transactions[idx]);
});

const port = 3000;
app.listen(port, () => console.log(`Example server listening on http://localhost:${port}`));
