const express = require('express');
const {
  listShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} = require('../controllers/shoppingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', listShoppingItems);
router.post('/', createShoppingItem);
router.put('/:id', updateShoppingItem);
router.delete('/:id', deleteShoppingItem);

module.exports = router;
