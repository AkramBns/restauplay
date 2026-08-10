const express = require('express');
const {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.use(requireAuth);

router.get('/', listAnnouncements);
router.post('/', requireRole('admin'), createAnnouncement);
router.put('/:id', requireRole('admin'), updateAnnouncement);
router.delete('/:id', requireRole('admin'), deleteAnnouncement);

module.exports = router;
