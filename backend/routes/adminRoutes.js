const express = require('express');
const router = express.Router();
const {
  getAdminStats, listUsers, updateUserRole, deleteUser, seedCompany,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require both auth and admin middleware
router.use(auth, admin);

router.get('/stats', getAdminStats);
router.get('/users', listUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.post('/seed-company', seedCompany);

module.exports = router;
