# Smart Learning & Assignment Management System - Project Plan

## Phase 1: Backend Setup & Database Models
- [x] Initialize Node.js project with Express
- [x] Setup MongoDB connection with Mongoose
- [x] Create User model (name, email, password, role: student/faculty/admin)
- [x] Create Course model (title, description, facultyId)
- [x] Create Assignment model (title, description, dueDate, courseId)
- [x] Create Submission model (assignmentId, studentId, fileUrl, marks, feedback)
- [x] Create Enrollment model (studentId, courseId, unique index)

## Phase 2: Backend Authentication
- [x] Implement password hashing with bcrypt
- [x] Implement JWT token generation
- [x] Create auth middleware for protected routes
- [x] POST /api/auth/register endpoint
- [x] POST /api/auth/login endpoint
- [x] Input validations (email, password length, role required)
- [x] Auto-seed admin user on first startup (admin@gmail.com / admin@123)

## Phase 3: Backend API Routes
- [x] POST /api/courses (faculty creates course)
- [x] GET /api/courses (list all courses)
- [x] GET /api/courses/:id (get single course)
- [x] POST /api/assignments (faculty creates assignment)
- [x] GET /api/assignments/course/:courseId (get assignments for a course)
- [x] POST /api/submissions (student submits assignment)
- [x] GET /api/submissions/assignment/:assignmentId (faculty views submissions)
- [x] PUT /api/submissions/:id/grade (faculty grades submission with marks & feedback)
- [x] GET /api/submissions/my (student views own submissions with grades)
- [x] Role-based route protection (student vs faculty vs admin)

## Phase 4: Enrollment System
- [x] POST /api/enrollments (student enrolls in course)
- [x] GET /api/enrollments/my (student's enrolled courses)
- [x] GET /api/enrollments/course/:courseId (enrolled students list)
- [x] DELETE /api/enrollments/course/:courseId (student unenrolls)
- [x] Duplicate enrollment prevention

## Phase 5: Admin System
- [x] GET /api/admin/stats (dashboard stats: users, courses, assignments, etc.)
- [x] GET /api/admin/users (list all users)
- [x] DELETE /api/admin/users/:id (delete user + cleanup related data)
- [x] PUT /api/admin/users/:id/role (change user role)
- [x] POST /api/admin/courses (admin creates course, assigns faculty)
- [x] DELETE /api/admin/courses/:id (delete course + cleanup related data)

## Phase 6: Angular Frontend Setup
- [x] Initialize Angular 17 project (standalone components)
- [x] Setup routing module with lazy loading
- [x] Create AuthService, CourseService, AssignmentService, SubmissionService
- [x] Create EnrollmentService, AdminService
- [x] Create AuthGuard, FacultyGuard, StudentGuard, AdminGuard
- [x] Create HTTP interceptor for JWT token

## Phase 7: Frontend - Auth Pages
- [x] Login page (email, password inputs)
- [x] Register page (name, email, password, role selection)
- [x] Form validations and error messages
- [x] Redirect to dashboard after login

## Phase 8: Frontend - Layout & Navigation
- [x] Navbar component (brand, user info, logout)
- [x] Sidebar navigation (role-based: student/faculty/admin menus)
- [x] Layout component with sidebar + content area

## Phase 9: Frontend - Student Features
- [x] Student Dashboard (enrolled courses, all available courses with enroll status)
- [x] Course Detail page with Enroll/Unenroll button
- [x] Submit Assignment page (only if enrolled)
- [x] My Submissions page (view grades & feedback)

## Phase 10: Frontend - Faculty Features
- [x] Faculty Dashboard (own courses, recent assignments)
- [x] Create Course form
- [x] Create Assignment form (linked to course)
- [x] View Submissions page with inline grading (marks 0-100 + feedback)
- [x] View enrolled students per course

## Phase 11: Frontend - Admin Panel
- [x] Admin Dashboard (stats: total users, students, faculty, courses, etc.)
- [x] Manage Users page (view all, change role, delete)
- [x] Manage Courses page (create with faculty assignment, delete)

## Phase 12: Build & Testing
- [x] Angular build passes without errors
- [x] All backend files pass syntax validation
- [x] Complete flow: Register → Login → Enroll → Submit → Grade → View Grades
