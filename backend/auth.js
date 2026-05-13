const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

// Register function
const register = (db) => {
  return async (req, res) => {
    const { email, password, name, family_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }



    try {
      // Check if user already exists
      const existingEmployee = db.prepare('SELECT * FROM Employee WHERE email = ?').get(email);
      if (existingEmployee) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const stmt = db.prepare(`
        INSERT INTO Employee (name, family_name, email, password)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(name || null, family_name || null, email, hashedPassword);

      res.json({ message: 'User created successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Login function
const login = (db) => {

  return async (req, res) => {

    const { email, password } = req.body;
    console.log('Login attempt:', email + ' / ' + password  );

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      // Find employee by email
      const employee = db.prepare('SELECT * FROM Employee WHERE email = ?').get(email);

      if (!employee) {
        return res.status(400).json({ message: 'Invalid credentials1' });
      }

      const password = "123";

        // Generate a real hash
        //const hash = await bcrypt.hash(password, 10);
        //console.log("Generated hash:", hash);
      // Verify password
      console.log('Comparing password for user:', email + ' / ' + password );
      const isMatch = await bcrypt.compare(password, employee.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { employeeId: employee.id, email: employee.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
     
      res.status(200).json({ accessToken: token });
      console.log('Login for user:', email + ' response  ' + res );
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  JWT_SECRET
};
