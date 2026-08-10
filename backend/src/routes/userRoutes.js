const express = require('express');
const { listUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

// Entire staff registry module is admin-only.
router.use(requireAuth, requireRole('admin'));

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
