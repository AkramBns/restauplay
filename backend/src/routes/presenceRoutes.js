const express = require('express');
const { listPresence, upsertPresence, deletePresence } = require('../controllers/presenceController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

// Presence module is admin-only.
router.use(requireAuth, requireRole('admin'));

router.get('/', listPresence);
router.post('/', upsertPresence);
router.delete('/:id', deletePresence);

module.exports = router;
