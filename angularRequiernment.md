Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # 📘 Smart Learning Mini System (FSWD Project)---## 🧾 Project Overview### 📌 TitleSmart Learning and Assignment Management System (Mini Version)### 🎯 ObjectiveTo develop a simplified academic platform where:- Students can view courses and submit assignments- Faculty can create courses and assignments- Basic academic workflow is demonstrated using CRUD operationsThis is a **reduced version** of the major project, designed specifically for FSWD (50 marks).---## 🧱 Tech Stack (MEAN)| Layer | Technology ||------|------------|| Frontend | Angular || Backend | Node.js + Express.js || Database | MongoDB || Language | JavaScript |---## 🎯 Scope (IMPORTANT)This project includes **only core modules**:✔ Authentication (basic)  ✔ Course Management  ✔ Assignment Management  ✔ Submission System  ❌ No advanced analytics  ❌ No email system  ❌ No announcements  ❌ No progress tracking graphs  ---## 👥 User Roles### 1️⃣ Student- Login/Register- View courses- View assignments- Submit assignments### 2️⃣ Faculty- Login/Register- Create courses- Create assignments- View submissions---## 🔐 Authentication### Features- JWT-based authentication- Role-based access (student / faculty)### APIs```httpPOST /api/auth/registerPOST /api/auth/login   `

### Validations

*   Email must be valid
    
*   Password minimum length
    
*   Role required
    

🧩 CORE MODULES
===============

📘 1. Course Management
-----------------------

### Features

*   Faculty creates courses
    
*   Students view courses
    

### APIs

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST /api/coursesGET /api/coursesGET /api/courses/:id   `

### Fields

*   title
    
*   description
    
*   facultyId
    

📝 2. Assignment Management
---------------------------

### Features

*   Faculty creates assignments
    
*   Assignments linked to courses
    

### APIs

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST /api/assignmentsGET /api/courses/:id/assignments   `

### Fields

*   title
    
*   description
    
*   dueDate
    
*   courseId
    

📤 3. Submission System
-----------------------

### Features

*   Students submit assignments
    
*   Faculty views submissions
    

### APIs

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST /api/submissionsGET /api/assignments/:id/submissions   `

### Fields

*   assignmentId
    
*   studentId
    
*   fileUrl
    

🧠 DATABASE MODELS
==================

User
----

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {  name,  email,  password,  role}   `

Course
------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {  title,  description,  facultyId}   `

Assignment
----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {  title,  description,  dueDate,  courseId}   `

Submission
----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {  assignmentId,  studentId,  fileUrl}   `

🎨 FRONTEND DESIGN (ANGULAR)
============================

🟢 Pages Required
-----------------

### 1️⃣ Login Page

*   Email input
    
*   Password input
    
*   Role selection (optional)
    

### 2️⃣ Register Page

*   Name
    
*   Email
    
*   Password
    
*   Role
    

### 3️⃣ Dashboard

#### Student Dashboard

*   List of courses
    
*   Recent assignments
    

#### Faculty Dashboard

*   Created courses
    
*   Assignments overview
    

### 4️⃣ Course List Page

*   Display all courses
    
*   Card layout
    
*   Click → course details
    

### 5️⃣ Course Details Page

*   Course title
    
*   Assignment list
    
*   Submit button (for students)
    

### 6️⃣ Assignment Submission Page

*   Upload file (URL or mock input)
    
*   Submit button
    

### 7️⃣ Faculty Assignment Page

*   Create assignment form
    
*   View submissions
    

🎨 UI Design Guidelines
-----------------------

*   Clean and minimal UI
    
*   Light theme (white + gray + black)
    
*   Card-based layout
    
*   Sidebar navigation
    
*   Simple tables for data
    

📐 Layout Structure
-------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NavbarSidebarMain Content Area   `

⚙️ VALIDATIONS
==============

Backend
-------

*   No empty inputs
    
*   Valid ObjectId
    
*   Required fields check
    
*   Prevent duplicate submissions
    

Frontend
--------

*   Required fields
    
*   Basic form validation
    
*   Error messages
    

🔐 SECURITY
===========

*   JWT authentication
    
*   Password hashing (bcrypt)
    
*   Protected routes
    

🧪 TEST CASES
=============

✔ Register user✔ Login user✔ Create course✔ Create assignment✔ Submit assignment✔ View submissions

📁 PROJECT STRUCTURE
====================

Backend
-------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   server/ ├── models/ ├── routes/ ├── controllers/ ├── middleware/ └── server.js   `

Frontend (Angular)
------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   src/ ├── app/ │   ├── components/ │   ├── pages/ │   ├── services/ │   └── app.module.ts   `

🎯 FINAL OUTCOME
================

This mini project demonstrates:

✔ Fullstack development using MEAN✔ CRUD operations✔ Role-based system✔ API integration✔ Clean UI