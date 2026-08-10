const express = require('express');
const { listVacations, createVacation, updateVacation, deleteVacation } = require('../controllers/vacationController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

// Vacation module is admin-only.
router.use(requireAuth, requireRole('admin'));

router.get('/', listVacations);
router.post('/', createVacation);
router.put('/:id', updateVacation);
router.delete('/:id', deleteVacation);

module.exports = router;
