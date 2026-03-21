const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, roleAuth } = require('../middleware/auth');
const {
  createSubmission,
  getSubmissionsByAssignment,
  gradeSubmission,
  getMySubmissions,
  downloadFile,
} = require('../controllers/submissionController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.rar', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Allowed: pdf, doc, docx, txt, ppt, pptx, xls, xlsx, zip, rar, jpg, jpeg, png'));
    }
  },
});

// Student submits assignment with file upload
router.post('/', auth, roleAuth('student'), upload.single('file'), createSubmission);

// Student views their submissions
router.get('/my', auth, roleAuth('student'), getMySubmissions);

// Download submission file
router.get('/:id/download', auth, downloadFile);

// Get submissions for an assignment (faculty/admin)
router.get('/assignment/:assignmentId', auth, getSubmissionsByAssignment);

// Faculty grades a submission
router.put('/:id/grade', auth, roleAuth('faculty'), gradeSubmission);

module.exports = router;
