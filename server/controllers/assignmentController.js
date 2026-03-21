const Assignment = require('../models/Assignment');

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;

    if (!title || !description || !dueDate || !courseId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      courseId,
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ courseId: req.params.courseId });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('courseId');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createAssignment, getAssignmentsByCourse, getAssignmentById };
