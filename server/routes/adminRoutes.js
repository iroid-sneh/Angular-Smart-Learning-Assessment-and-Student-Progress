const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUser,
  adminCreateCourse,
  adminDeleteCourse,
  adminUpdateCourse,
  adminUpdateAssignment,
  adminDeleteAssignment,
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
router.put('/users/:id', updateUser);

// Course management
router.post('/courses', adminCreateCourse);
router.delete('/courses/:id', adminDeleteCourse);
router.put('/courses/:id', adminUpdateCourse);

// Assignment management
router.put('/assignments/:id', adminUpdateAssignment);
router.delete('/assignments/:id', adminDeleteAssignment);

module.exports = router;
