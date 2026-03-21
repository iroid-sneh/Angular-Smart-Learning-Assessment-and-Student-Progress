const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');

const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }

    const course = new Course({
      title,
      description,
      facultyId: req.user._id,
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('facultyId', 'name email');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('facultyId', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Faculty dashboard stats - courses with enrollment, assignment, submission details
const getFacultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const courses = await Course.find({ facultyId });

    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });
        const enrolledStudents = await Enrollment.find({ courseId: course._id })
          .populate('studentId', 'name email')
          .sort({ createdAt: -1 });

        const assignments = await Assignment.find({ courseId: course._id }).sort({ dueDate: -1 });
        const assignmentIds = assignments.map(a => a._id);

        const totalSubmissions = await Submission.countDocuments({ assignmentId: { $in: assignmentIds } });
        const gradedSubmissions = await Submission.countDocuments({ assignmentId: { $in: assignmentIds }, marks: { $ne: null } });
        const pendingSubmissions = totalSubmissions - gradedSubmissions;

        // Recent submissions for this course
        const recentSubmissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
          .populate('studentId', 'name email')
          .populate('assignmentId', 'title')
          .sort({ submittedAt: -1 })
          .limit(5);

        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          createdAt: course.createdAt,
          enrollmentCount,
          enrolledStudents: enrolledStudents.map(e => ({
            _id: e.studentId?._id,
            name: e.studentId?.name,
            email: e.studentId?.email,
            enrolledAt: e.createdAt,
          })),
          assignments: assignments.map(a => ({
            _id: a._id,
            title: a.title,
            dueDate: a.dueDate,
          })),
          totalSubmissions,
          gradedSubmissions,
          pendingSubmissions,
          recentSubmissions,
        };
      })
    );

    // Overall stats
    const totalCourses = courses.length;
    const totalStudents = new Set(
      (await Enrollment.find({ courseId: { $in: courses.map(c => c._id) } }))
        .map(e => e.studentId.toString())
    ).size;
    const allAssignmentIds = (await Assignment.find({ courseId: { $in: courses.map(c => c._id) } })).map(a => a._id);
    const totalAssignments = allAssignmentIds.length;
    const totalSubmissions = await Submission.countDocuments({ assignmentId: { $in: allAssignmentIds } });
    const totalGraded = await Submission.countDocuments({ assignmentId: { $in: allAssignmentIds }, marks: { $ne: null } });

    res.json({
      stats: {
        totalCourses,
        totalStudents,
        totalAssignments,
        totalSubmissions,
        totalGraded,
        totalPending: totalSubmissions - totalGraded,
      },
      courses: courseStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createCourse, getCourses, getCourseById, getFacultyDashboard };
