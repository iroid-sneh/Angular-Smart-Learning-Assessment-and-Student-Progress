const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const bcrypt = require('bcryptjs');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }
    await User.findByIdAndDelete(id);
    // Clean up related data
    await Enrollment.deleteMany({ studentId: id });
    await Submission.deleteMany({ studentId: id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin creates a course (assigns to a faculty)
const adminCreateCourse = async (req, res) => {
  try {
    const { title, description, facultyId } = req.body;
    if (!title || !description || !facultyId) {
      return res.status(400).json({ message: 'Title, description, and faculty ID are required' });
    }
    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(400).json({ message: 'Invalid faculty ID' });
    }
    const course = await Course.create({ title, description, facultyId });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin deletes a course
const adminDeleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    // Clean up related data
    const assignments = await Assignment.find({ courseId: id });
    const assignmentIds = assignments.map(a => a._id);
    await Assignment.deleteMany({ courseId: id });
    await Submission.deleteMany({ assignmentId: { $in: assignmentIds } });
    await Enrollment.deleteMany({ courseId: id });
    res.json({ message: 'Course and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalCourses = await Course.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const gradedSubmissions = await Submission.countDocuments({ marks: { $ne: null } });
    const pendingSubmissions = await Submission.countDocuments({ marks: null });

    // Recent users (last 10)
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);

    // All courses with enrollment and assignment counts
    const courses = await Course.find()
      .populate('facultyId', 'name email')
      .sort({ createdAt: -1 });

    const courseDetails = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });
        const assignmentCount = await Assignment.countDocuments({ courseId: course._id });
        const assignments = await Assignment.find({ courseId: course._id });
        const assignmentIds = assignments.map(a => a._id);
        const submissionCount = await Submission.countDocuments({ assignmentId: { $in: assignmentIds } });
        const gradedCount = await Submission.countDocuments({ assignmentId: { $in: assignmentIds }, marks: { $ne: null } });
        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          facultyName: course.facultyId ? course.facultyId.name : 'N/A',
          facultyEmail: course.facultyId ? course.facultyId.email : '',
          createdAt: course.createdAt,
          enrollmentCount,
          assignmentCount,
          submissionCount,
          gradedCount,
        };
      })
    );

    // Recent submissions (last 10)
    const recentSubmissions = await Submission.find()
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title courseId')
      .sort({ submittedAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalStudents,
      totalFaculty,
      totalCourses,
      totalAssignments,
      totalSubmissions,
      totalEnrollments,
      gradedSubmissions,
      pendingSubmissions,
      recentUsers,
      courseDetails,
      recentSubmissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin updates a user (name, email)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin updates a course
const adminUpdateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, facultyId } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (facultyId) {
      const faculty = await User.findById(facultyId);
      if (!faculty || faculty.role !== 'faculty') {
        return res.status(400).json({ message: 'Invalid faculty ID' });
      }
      updateData.facultyId = facultyId;
    }
    const course = await Course.findByIdAndUpdate(id, updateData, { new: true }).populate('facultyId', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin updates an assignment
const adminUpdateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = dueDate;
    const assignment = await Assignment.findByIdAndUpdate(id, updateData, { new: true });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin deletes an assignment
const adminDeleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await Submission.deleteMany({ assignmentId: id });
    res.json({ message: 'Assignment and related submissions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
