const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const { createCourse, getCourses, getCourseById, getFacultyDashboard } = require('../controllers/courseController');

router.get('/faculty/dashboard', auth, roleAuth('faculty'), getFacultyDashboard);
router.post('/', auth, roleAuth('faculty'), createCourse);
router.get('/', auth, getCourses);
router.get('/:id', auth, getCourseById);

module.exports = router;
