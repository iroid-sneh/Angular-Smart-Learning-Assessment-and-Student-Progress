const Submission = require('../models/Submission');
const path = require('path');
const fs = require('fs');

// Student submits assignment (with file upload)
const createSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      // Delete the uploaded file since we're rejecting
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user._id,
      fileUrl: req.file.filename,
      originalName: req.file.originalname,
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get submissions for an assignment
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Faculty grades a submission
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined || marks === null) {
      return res.status(400).json({ message: 'Marks are required' });
    }

    if (marks < 0 || marks > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }

    const submission = await Submission.findByIdAndUpdate(
      id,
      { marks, feedback: feedback || '' },
      { new: true }
    ).populate('studentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Student views their own submissions
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('assignmentId', 'title description dueDate courseId');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download a submission file
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', submission.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const downloadName = submission.originalName || submission.fileUrl;
    res.download(filePath, downloadName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createSubmission, getSubmissionsByAssignment, gradeSubmission, getMySubmissions, downloadFile };
