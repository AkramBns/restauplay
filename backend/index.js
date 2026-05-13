const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const { register, login, verifyToken } = require('./auth');

const app = express();
app.use(express.json());

// SQLite database
const dbPath = path.join(__dirname, 'shopping.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// ===========================
// Authentication
// ===========================

// Register endpoint
app.post('/register', register(db));

// Login endpoint
app.post('/auth/login', login(db));

// ===========================
// Employee
// ===========================

// Create Employee
app.post('/employees', verifyToken, (req, res) => {
  const { name, family_name, email, address, phone_number, function: jobFunction } = req.body;

  if (!name || !family_name || !email) {
    return res.status(400).json({ error: 'name, family_name, and email are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO Employee (name, family_name, email, address, phone_number, function)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, family_name, email, address || null, phone_number || null, jobFunction || null);
    const employee = db.prepare('SELECT * FROM Employee WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
});

// Get all Employees
app.get('/employees', verifyToken, (req, res) => {
  const employees = db.prepare('SELECT * FROM Employee').all();
  res.json(employees);
});

// ===========================
// ShoppingGroup
// ===========================

// Create ShoppingGroup
app.post('/groups', verifyToken, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const stmt = db.prepare('INSERT INTO ShoppingGroup (name, description) VALUES (?, ?)');
  const result = stmt.run(name, description || null);
  const group = db.prepare('SELECT * FROM ShoppingGroup WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(group);
});

// Get all ShoppingGroups
app.get('/groups', verifyToken, (req, res) => {
  const groups = db.prepare('SELECT * FROM ShoppingGroup').all();
  res.json(groups);
});

// ===========================
// ShoppingItem
// ===========================

// Create ShoppingItem
app.post('/items', verifyToken, (req, res) => {
  const { name, group_id, description } = req.body;
  if (!name || !group_id) return res.status(400).json({ error: 'name and group_id are required' });

  try {
    const stmt = db.prepare('INSERT INTO ShoppingItem (name, group_id, description) VALUES (?, ?, ?)');
    const result = stmt.run(name, group_id, description || null);
    const item = db.prepare('SELECT * FROM ShoppingItem WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'Invalid group_id or database error' });
  }
});

// Get all ShoppingItems
app.get('/items', verifyToken, (req, res) => {
  const items = db.prepare('SELECT * FROM ShoppingItem').all();
  for (const item of items) {
  console.log(item);
}
  res.json(items);
});

// ===========================
// ShoppingTransaction
// ===========================

// Create ShoppingTransaction
app.post('/transactions', verifyToken, (req, res) => {
  const { description, state, shopping_item_id, employee_id, price, quantity, supplier } = req.body;
  if (!shopping_item_id || !employee_id) return res.status(400).json({ error: 'shopping_item_id and employee_id are required' });

  try {
    const stmt = db.prepare(`
      INSERT INTO ShoppingTransaction 
      (description, state, shopping_item_id, employee_id, price, quantity, supplier, creation_date, update_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const result = stmt.run(description || null, state || 'pending', shopping_item_id, employee_id, price || null, quantity || null, supplier || null);
    const transaction = db.prepare('SELECT * FROM ShoppingTransaction WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: 'Invalid shopping_item_id or employee_id' });
  }
});

// Update ShoppingTransaction
app.put('/transactions/:id', verifyToken, (req, res) => {
  const { description, state, shopping_item_id, employee_id, price, quantity, supplier } = req.body;
  console.log("update transaction : ", req.body);
  const id = req.params.id;
  if (!shopping_item_id || !employee_id) return res.status(400).json({ error: 'shopping_item_id and employee_id are required' });

  try {
    const stmt = db.prepare(`
      UPDATE ShoppingTransaction
      SET description = ?, state = ?, shopping_item_id = ?, employee_id = ?, price = ?, quantity = ?, supplier = ?, update_date = datetime('now')
      WHERE id = ?
    `);
    const result = stmt.run(description || null, state || 'pending', shopping_item_id, employee_id, price || null, quantity || null, supplier || null, id);
    console.log("update result : ", result);
    const transaction = db.prepare('SELECT * FROM ShoppingTransaction WHERE id = ?').get(id);
    res.status(200).json(transaction);
  } catch (err) {
    console.error("update error: " + err); // Print the error stack trace
    res.status(400).json({ error: 'Invalid shopping_item_id or employee_id' });
  }
});

// Get all ShoppingTransactions
app.get('/transactions', verifyToken, (req, res) => {
  const transactions = db.prepare('SELECT tr.id, tr.description as description, tr.state as state,tr.unit as unit, tr.price, tr.quantity, tr.supplier, it.name as item_name , it.name as name FROM ShoppingTransaction tr INNER JOIN ShoppingItem it on tr.shopping_item_id = it.id').all();
   for (const item of transactions) {
       console.log(item);
}
  res.json(transactions);
});

// ===========================
// Start server
// ===========================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
