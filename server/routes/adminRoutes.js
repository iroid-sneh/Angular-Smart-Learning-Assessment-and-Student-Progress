const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUser,
  getUserDeleteImpact,
  reassignFacultyCourses,
  adminCreateCourse,
  adminDeleteCourse,
  adminUpdateCourse,
  adminUpdateAssignment,
  adminDeleteAssignment,
  getCourseDeleteImpact,
  getDashboardStats,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(auth, roleAuth('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id/impact', getUserDeleteImpact);
router.put('/users/:id/reassign-courses', reassignFacultyCourses);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id', updateUser);

// Course management
router.get('/courses/:id/impact', getCourseDeleteImpact);
router.post('/courses', adminCreateCourse);
router.delete('/courses/:id', adminDeleteCourse);
router.put('/courses/:id', adminUpdateCourse);

// Assignment management
router.put('/assignments/:id', adminUpdateAssignment);
router.delete('/assignments/:id', adminDeleteAssignment);

module.exports = router;
