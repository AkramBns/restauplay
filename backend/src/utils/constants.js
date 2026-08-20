const ROLES = ['staff', 'buyer', 'admin'];
const DEBUG_REQUEST_LOGGING = process.env.DEBUG_REQUEST_LOGGING === 'true';

const SHOPPING_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

const PRESENCE_STATUSES = ['present', 'absent', 'late', 'sick'];

const VACATION_TYPES = ['vacation', 'sick', 'unpaid', 'other'];
const VACATION_STATUSES = ['requested', 'approved', 'rejected'];

// Roles that can act as a "buyer" for shopping purposes (buyer + admin)
function canManageAllShoppingItems(role) {
  return role === 'buyer' || role === 'admin';
}

function isAdmin(role) {
  return role === 'admin';
}

module.exports = {
  ROLES,
  DEBUG_REQUEST_LOGGING,
  SHOPPING_STATUSES,
  PRESENCE_STATUSES,
  VACATION_TYPES,
  VACATION_STATUSES,
  canManageAllShoppingItems,
  isAdmin,
};
