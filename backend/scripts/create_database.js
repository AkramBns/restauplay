// dbSetup.js
const Database = require('better-sqlite3');
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'shopping.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Creating tables...');

// ===========================
// Table: Employee
// ===========================
db.prepare(`
  CREATE TABLE IF NOT EXISTS Employee (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    address TEXT,
    phone_number TEXT,
    function TEXT
  )
`).run();

// ===========================
// Table: ShoppingGroup
// ===========================
db.prepare(`
  CREATE TABLE IF NOT EXISTS ShoppingGroup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )
`).run();

// ===========================
// Table: ShoppingItem
// ===========================
db.prepare(`
  CREATE TABLE IF NOT EXISTS ShoppingItem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    group_id INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (group_id) REFERENCES ShoppingGroup(id) ON DELETE CASCADE
  )
`).run();

// ===========================
// Table: ShoppingTransaction
// ===========================
db.prepare(`
  CREATE TABLE IF NOT EXISTS ShoppingTransaction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    state TEXT,
    shopping_item_id INTEGER NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    employee_id INTEGER,
    price REAL,
    quantity INTEGER,
    supplier TEXT,
    FOREIGN KEY (shopping_item_id) REFERENCES ShoppingItem(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES Employee(id) ON DELETE SET NULL
  )
`).run();

console.log('All tables created successfully!');
db.close();
