const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  adminCreateCourse,
  adminDeleteCourse,
  getDashboardStats,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(auth, roleAuth('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Course management
router.post('/courses', adminCreateCourse);
router.delete('/courses/:id', adminDeleteCourse);

module.exports = router;
