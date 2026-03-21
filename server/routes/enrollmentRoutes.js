const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const {
  enrollInCourse,
  getMyEnrollments,
  getEnrolledStudents,
  unenrollFromCourse,
} = require('../controllers/enrollmentController');

// Student enrolls in a course
router.post('/', auth, roleAuth('student'), enrollInCourse);

// Student gets their enrolled courses
router.get('/my', auth, roleAuth('student'), getMyEnrollments);

// Get students enrolled in a course (faculty/admin)
router.get('/course/:courseId', auth, getEnrolledStudents);

// Student unenrolls from a course
router.delete('/course/:courseId', auth, roleAuth('student'), unenrollFromCourse);

module.exports = router;
