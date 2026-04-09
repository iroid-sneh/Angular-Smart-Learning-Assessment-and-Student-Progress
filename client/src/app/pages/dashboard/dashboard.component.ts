import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { CourseService, Course } from '../../services/course.service';
import { EnrollmentService, Enrollment } from '../../services/enrollment.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <h1>Welcome, {{ user?.name }}</h1>
      <p class="role-badge">{{ user?.role | titlecase }}</p>

      <!-- ============ STUDENT DASHBOARD ============ -->
      <div *ngIf="user?.role === 'student'">
        <h2>My Enrolled Courses</h2>
        <div class="card-grid">
          <div class="card" *ngFor="let e of enrolledCourses" [routerLink]="['/courses', getCourseId(e)]">
            <h3>{{ getCourseProp(e, 'title') }}</h3>
            <p>{{ getCourseProp(e, 'description') }}</p>
            <span class="card-meta">Enrolled {{ e.createdAt | date:'mediumDate' }}</span>
          </div>
          <p *ngIf="enrolledCourses.length === 0" class="empty-msg">You haven't enrolled in any courses yet. Browse courses to enroll.</p>
        </div>

        <h2>All Available Courses</h2>
        <div class="card-grid">
          <div class="card" *ngFor="let course of courses" [routerLink]="['/courses', course._id]">
            <h3>{{ course.title }}</h3>
            <p>{{ course.description }}</p>
            <div class="card-footer">
              <span class="card-meta">By {{ course.facultyId?.name }}</span>
              <span class="enrolled-tag" *ngIf="isEnrolled(course._id)">Enrolled</span>
            </div>
          </div>
          <p *ngIf="courses.length === 0" class="empty-msg">No courses available yet.</p>
        </div>
      </div>

      <!-- ============ FACULTY DASHBOARD ============ -->
      <div *ngIf="user?.role === 'faculty'">
        <!-- Faculty Stats -->
        <div class="stats-grid" *ngIf="facultyData?.stats">
          <div class="stat-card">
            <div class="stat-number">{{ facultyData.stats.totalCourses }}</div>
            <div class="stat-label">My Courses</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ facultyData.stats.totalStudents }}</div>
            <div class="stat-label">Total Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ facultyData.stats.totalAssignments }}</div>
            <div class="stat-label">Assignments</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ facultyData.stats.totalSubmissions }}</div>
            <div class="stat-label">Submissions</div>
          </div>
          <div class="stat-card accent">
            <div class="stat-number">{{ facultyData.stats.totalGraded }}</div>
            <div class="stat-label">Graded</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-number">{{ facultyData.stats.totalPending }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>

        <!-- Course-wise Details -->
        <div *ngFor="let course of facultyData?.courses" class="course-section">
          <div class="course-section-header" [routerLink]="['/courses', course._id]">
            <h2>{{ course.title }}</h2>
            <div class="course-badges">
              <span class="badge">{{ course.enrollmentCount }} Students</span>
              <span class="badge">{{ course.assignments?.length || 0 }} Assignments</span>
              <span class="badge">{{ course.totalSubmissions }} Submissions</span>
              <span class="badge accent" *ngIf="course.pendingSubmissions > 0">{{ course.pendingSubmissions }} Pending</span>
            </div>
          </div>

          <!-- Enrolled Students -->
          <div class="sub-section" *ngIf="course.enrolledStudents?.length > 0">
            <div class="sub-header">
              <h3>Enrolled Students</h3>
              <div class="export-btns">
                <button class="btn-export" (click)="exportStudentsCSV(course)">CSV</button>
                <button class="btn-export" (click)="exportStudentsExcel(course)">Excel</button>
              </div>
            </div>
            <table class="data-table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Enrolled On</th></tr></thead>
              <tbody>
                <tr *ngFor="let s of course.enrolledStudents; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>{{ s.name }}</td>
                  <td>{{ s.email }}</td>
                  <td>{{ s.enrolledAt | date:'mediumDate' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Assignments -->
          <div class="sub-section" *ngIf="course.assignments?.length > 0">
            <h3>Assignments</h3>
            <div class="assignment-chips">
              <span *ngFor="let a of course.assignments" class="chip" [routerLink]="['/view-submissions']" [queryParams]="{assignmentId: a._id}">
                {{ a.title }} <span class="chip-date">Due: {{ a.dueDate | date:'shortDate' }}</span>
              </span>
            </div>
          </div>

          <!-- Recent Submissions -->
          <div class="sub-section" *ngIf="course.recentSubmissions?.length > 0">
            <div class="sub-header">
              <h3>Recent Submissions</h3>
              <div class="export-btns">
                <button class="btn-export" (click)="exportCourseSubmissionsCSV(course)">CSV</button>
                <button class="btn-export" (click)="exportCourseSubmissionsExcel(course)">Excel</button>
              </div>
            </div>
            <table class="data-table">
              <thead><tr><th>Student</th><th>Assignment</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let sub of course.recentSubmissions">
                  <td>{{ sub.studentId?.name || '-' }}</td>
                  <td>{{ sub.assignmentId?.title || '-' }}</td>
                  <td>{{ sub.submittedAt | date:'short' }}</td>
                  <td>
                    <span class="status graded" *ngIf="sub.marks !== null">{{ sub.marks }}/100</span>
                    <span class="status pending" *ngIf="sub.marks === null">Pending</span>
                  </td>
                  <td>
                    <a [routerLink]="['/view-submissions']" [queryParams]="{assignmentId: sub.assignmentId?._id}" class="link">Grade</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p *ngIf="facultyData?.courses?.length === 0" class="empty-msg">You haven't created any courses yet. <a routerLink="/create-course">Create one now</a></p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard h1 { margin: 0 0 4px; color: #1a1a2e; }
    .role-badge {
      display: inline-block; padding: 4px 12px; background: #e9ecef;
      border-radius: 12px; font-size: 0.8rem; color: #555; margin-bottom: 24px;
    }
    h2 { color: #333; margin: 24px 0 12px; font-size: 1.15rem; }
    h3 { color: #555; margin: 12px 0 8px; font-size: 0.95rem; }

    /* Stats */
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px; margin-bottom: 28px;
    }
    .stat-card {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
      padding: 16px; text-align: center;
    }
    .stat-card.accent { border-left: 3px solid #2e7d32; }
    .stat-card.warning { border-left: 3px solid #e94560; }
    .stat-number { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 0.8rem; color: #888; margin-top: 2px; }

    /* Course section */
    .course-section {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
      padding: 20px; margin-bottom: 20px;
    }
    .course-section-header { cursor: pointer; margin-bottom: 12px; }
    .course-section-header h2 { margin: 0 0 8px; color: #1a1a2e; font-size: 1.1rem; }
    .course-badges { display: flex; flex-wrap: wrap; gap: 8px; }
    .badge {
      padding: 3px 10px; background: #e9ecef; border-radius: 10px;
      font-size: 0.78rem; color: #555;
    }
    .badge.accent { background: #fff3e0; color: #e65100; }

    .sub-section { margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f0f0; }

    /* Tables */
    .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .data-table th, .data-table td {
      padding: 8px 12px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 0.85rem;
    }
    .data-table th { background: #fafafa; color: #555; font-weight: 600; }

    /* Status */
    .status {
      display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 500;
    }
    .status.graded { background: #e0f7e0; color: #2e7d32; }
    .status.pending { background: #fff3e0; color: #e65100; }

    .link { color: #1a1a2e; font-size: 0.85rem; text-decoration: underline; }

    /* Assignment chips */
    .assignment-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      padding: 6px 14px; background: #f8f9fa; border: 1px solid #e0e0e0;
      border-radius: 16px; font-size: 0.85rem; color: #333; cursor: pointer;
      transition: background 0.2s;
    }
    .chip:hover { background: #e9ecef; }
    .chip-date { font-size: 0.75rem; color: #999; margin-left: 6px; }

    /* Cards */
    .card-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
    }
    .card {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
      padding: 20px; cursor: pointer; transition: box-shadow 0.2s;
    }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card h3 { margin: 0 0 8px; color: #1a1a2e; font-size: 1.05rem; }
    .card p { margin: 0 0 12px; color: #666; font-size: 0.9rem; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .card-meta { font-size: 0.8rem; color: #999; }
    .enrolled-tag {
      font-size: 0.75rem; padding: 2px 8px; background: #e0f7e0;
      color: #2e7d32; border-radius: 8px; font-weight: 500;
    }
    .empty-msg { color: #999; font-style: italic; }
    .empty-msg a { color: #1a1a2e; font-weight: 500; }
    .sub-header { display: flex; justify-content: space-between; align-items: center; }
    .export-btns { display: flex; gap: 6px; }
    .btn-export {
      padding: 3px 10px; background: #00897b; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.75rem;
    }
    .btn-export:hover { background: #00695c; }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  enrolledCourses: Enrollment[] = [];
  enrolledCourseIds: Set<string> = new Set();
  facultyData: any = null;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private exportService: ExportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    if (this.user?.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    if (this.user?.role === 'student') {
      this.courseService.getCourses().subscribe({
        next: (courses) => this.courses = courses
      });
      this.enrollmentService.getMyEnrollments().subscribe({
        next: (enrollments) => {
          this.enrolledCourses = enrollments;
          enrollments.forEach(e => {
            const cId = typeof e.courseId === 'object' ? e.courseId._id : e.courseId;
            this.enrolledCourseIds.add(cId);
          });
        }
      });
    }

    if (this.user?.role === 'faculty') {
      this.courseService.getFacultyDashboard().subscribe({
        next: (data) => this.facultyData = data
      });
    }
  }

  isEnrolled(courseId: string): boolean {
    return this.enrolledCourseIds.has(courseId);
  }

  getCourseId(e: Enrollment): string {
    return typeof e.courseId === 'object' ? e.courseId._id : e.courseId;
  }

  getCourseProp(e: Enrollment, prop: string): string {
    return typeof e.courseId === 'object' ? (e.courseId as any)[prop] : '';
  }

  exportStudentsCSV(course: any): void {
    const data = (course.enrolledStudents || []).map((s: any) => ({
      name: s.name, email: s.email, enrolledOn: new Date(s.enrolledAt).toLocaleDateString()
    }));
    this.exportService.exportToCSV(data, `${course.title}_students`, { name: 'Name', email: 'Email', enrolledOn: 'Enrolled On' });
  }

  exportStudentsExcel(course: any): void {
    const data = (course.enrolledStudents || []).map((s: any) => ({
      name: s.name, email: s.email, enrolledOn: new Date(s.enrolledAt).toLocaleDateString()
    }));
    this.exportService.exportToExcel(data, `${course.title}_students`, { name: 'Name', email: 'Email', enrolledOn: 'Enrolled On' });
  }

  exportCourseSubmissionsCSV(course: any): void {
    const data = (course.recentSubmissions || []).map((s: any) => ({
      student: s.studentId?.name || '-', assignment: s.assignmentId?.title || '-',
      submitted: new Date(s.submittedAt).toLocaleString(),
      marks: s.marks !== null ? s.marks + '/100' : 'Pending'
    }));
    this.exportService.exportToCSV(data, `${course.title}_submissions`, { student: 'Student', assignment: 'Assignment', submitted: 'Submitted', marks: 'Marks' });
  }

  exportCourseSubmissionsExcel(course: any): void {
    const data = (course.recentSubmissions || []).map((s: any) => ({
      student: s.studentId?.name || '-', assignment: s.assignmentId?.title || '-',
      submitted: new Date(s.submittedAt).toLocaleString(),
      marks: s.marks !== null ? s.marks + '/100' : 'Pending'
    }));
    this.exportService.exportToExcel(data, `${course.title}_submissions`, { student: 'Student', assignment: 'Assignment', submitted: 'Submitted', marks: 'Marks' });
  }
}
