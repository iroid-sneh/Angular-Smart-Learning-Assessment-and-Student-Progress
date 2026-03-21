const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
} = require('../controllers/assignmentController');

router.post('/', auth, roleAuth('faculty'), createAssignment);
router.get('/course/:courseId', auth, getAssignmentsByCourse);
router.get('/:id', auth, getAssignmentById);

module.exports = router;
