const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Student enrolls in a course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const existing = await Enrollment.findOne({ studentId: req.user._id, courseId });
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId,
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get courses a student is enrolled in
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate({
        path: 'courseId',
        populate: { path: 'facultyId', select: 'name email' },
      });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students enrolled in a course
const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollments = await Enrollment.find({ courseId })
      .populate('studentId', 'name email');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unenroll from a course
const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOneAndDelete({
      studentId: req.user._id,
      courseId,
    });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { enrollInCourse, getMyEnrollments, getEnrolledStudents, unenrollFromCourse };
