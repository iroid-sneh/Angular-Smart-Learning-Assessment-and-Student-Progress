import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';
import { AssignmentService, Assignment } from '../../services/assignment.service';
import { AuthService } from '../../services/auth.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="course-detail" *ngIf="course">
      <div class="course-header">
        <div class="header-top">
          <div>
            <h1>{{ course.title }}</h1>
            <p class="course-desc">{{ course.description }}</p>
            <span class="course-faculty">Instructor: {{ course.facultyId?.name }}</span>
          </div>
          <div *ngIf="role === 'student'" class="enroll-section">
            <button *ngIf="!isEnrolled" class="btn btn-enroll" (click)="enroll()">Enroll in Course</button>
            <button *ngIf="isEnrolled" class="btn btn-unenroll" (click)="unenroll()">Unenroll</button>
          </div>
        </div>
        <div class="msg success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="msg error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Assignments</h2>
          <a *ngIf="role === 'faculty'" [routerLink]="['/create-assignment']" [queryParams]="{courseId: course._id}" class="btn btn-sm">+ New Assignment</a>
        </div>

        <div class="assignment-list">
          <div class="assignment-card" *ngFor="let a of assignments">
            <!-- Normal view -->
            <ng-container *ngIf="editingAssignmentId !== a._id">
              <div class="assignment-info">
                <h3>{{ a.title }}</h3>
                <p>{{ a.description }}</p>
                <span class="due-date">Due: {{ a.dueDate | date:'mediumDate' }}</span>
              </div>
              <div class="assignment-actions">
                <a *ngIf="role === 'student' && isEnrolled" [routerLink]="['/submit-assignment']" [queryParams]="{assignmentId: a._id}" class="btn btn-sm">Submit</a>
                <span *ngIf="role === 'student' && !isEnrolled" class="text-muted">Enroll to submit</span>
                <a *ngIf="role === 'faculty' || role === 'admin'" [routerLink]="['/view-submissions']" [queryParams]="{assignmentId: a._id}" class="btn btn-sm btn-outline">View Submissions</a>
                <button *ngIf="role === 'admin'" class="btn btn-sm btn-edit" (click)="startEditAssignment(a)">Edit</button>
                <button *ngIf="role === 'admin'" class="btn btn-sm btn-danger-sm" (click)="deleteAssignment(a._id)">Delete</button>
              </div>
            </ng-container>

            <!-- Edit view (admin only) -->
            <ng-container *ngIf="editingAssignmentId === a._id">
              <div class="edit-assignment-form">
                <div class="form-group">
                  <label>Title</label>
                  <input type="text" [(ngModel)]="editAssignment.title" [name]="'atitle_'+a._id" class="edit-input">
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea [(ngModel)]="editAssignment.description" [name]="'adesc_'+a._id" class="edit-input" rows="2"></textarea>
                </div>
                <div class="form-group">
                  <label>Due Date</label>
                  <input type="date" [(ngModel)]="editAssignment.dueDate" [name]="'adue_'+a._id" class="edit-input" [min]="todayDate">
                </div>
                <div class="edit-btns">
                  <button class="btn btn-sm btn-save" (click)="saveEditAssignment(a._id)">Save</button>
                  <button class="btn btn-sm btn-cancel" (click)="cancelEditAssignment()">Cancel</button>
                </div>
              </div>
            </ng-container>
          </div>
          <p *ngIf="assignments.length === 0" class="empty-msg">No assignments yet.</p>
        </div>
      </div>

      <!-- Enrolled Students (for faculty/admin) -->
      <div class="section" *ngIf="role === 'faculty' || role === 'admin'">
        <h2>Enrolled Students ({{ enrolledStudents.length }})</h2>
        <table class="data-table" *ngIf="enrolledStudents.length > 0">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Enrolled On</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of enrolledStudents; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ e.studentId?.name || '-' }}</td>
              <td>{{ e.studentId?.email || '-' }}</td>
              <td>{{ e.createdAt | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="enrolledStudents.length === 0" class="empty-msg">No students enrolled yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .course-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .course-header h1 { margin: 0 0 8px; color: #1a1a2e; }
    .course-desc { color: #666; margin: 0 0 8px; }
    .course-faculty { font-size: 0.85rem; color: #999; }
    .enroll-section { margin-left: 20px; flex-shrink: 0; }
    .btn-enroll {
      padding: 8px 20px; background: #2e7d32; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.9rem;
    }
    .btn-enroll:hover { background: #1b5e20; }
    .btn-unenroll {
      padding: 8px 20px; background: #e94560; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.9rem;
    }
    .btn-unenroll:hover { background: #c62828; }
    .msg { padding: 8px 12px; border-radius: 4px; margin-top: 12px; font-size: 0.9rem; }
    .success-msg { background: #e0f7e0; color: #2e7d32; }
    .error-msg { background: #ffe0e0; color: #c62828; }
    .section { margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { margin: 0; color: #333; }
    h2 { color: #333; margin: 20px 0 12px; font-size: 1.1rem; }
    .assignment-list { display: flex; flex-direction: column; gap: 12px; }
    .assignment-card {
      display: flex; justify-content: space-between; align-items: center;
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px 20px;
    }
    .assignment-info h3 { margin: 0 0 4px; color: #1a1a2e; font-size: 1rem; }
    .assignment-info p { margin: 0 0 4px; color: #666; font-size: 0.9rem; }
    .due-date { font-size: 0.8rem; color: #e94560; }
    .assignment-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .btn-sm {
      padding: 6px 14px; background: #1a1a2e; color: #fff; border: none;
      border-radius: 4px; font-size: 0.85rem; cursor: pointer; text-decoration: none; display: inline-block;
    }
    .btn-sm:hover { background: #16213e; }
    .btn-outline { background: transparent; color: #1a1a2e; border: 1px solid #1a1a2e; }
    .btn-outline:hover { background: #1a1a2e; color: #fff; }
    .btn-edit { background: #1565c0 !important; }
    .btn-edit:hover { background: #0d47a1 !important; }
    .btn-save { background: #2e7d32 !important; }
    .btn-save:hover { background: #1b5e20 !important; }
    .btn-cancel { background: #757575 !important; }
    .btn-cancel:hover { background: #616161 !important; }
    .btn-danger-sm { background: #e94560 !important; }
    .btn-danger-sm:hover { background: #c62828 !important; }
    .text-muted { color: #999; font-size: 0.85rem; }
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table th, .data-table td {
      padding: 10px 14px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.9rem;
    }
    .data-table th { background: #f8f9fa; color: #333; font-weight: 600; }
    .empty-msg { color: #999; font-style: italic; }
    .edit-assignment-form { width: 100%; }
    .edit-assignment-form .form-group { margin-bottom: 8px; }
    .edit-assignment-form label { display: block; font-size: 0.8rem; color: #555; margin-bottom: 2px; }
    .edit-input {
      width: 100%; padding: 6px 10px; border: 1px solid #1565c0; border-radius: 4px;
      font-size: 0.85rem; box-sizing: border-box; font-family: inherit;
    }
    .edit-btns { display: flex; gap: 8px; margin-top: 8px; }
  `]
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  assignments: Assignment[] = [];
  role: string | null = null;
  isEnrolled = false;
  enrolledStudents: any[] = [];
  successMsg = '';
  errorMsg = '';
  private courseId = '';

  // Admin edit assignment
  editingAssignmentId: string | null = null;
  editAssignment = { title: '', description: '', dueDate: '' };
  todayDate = '';

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.todayDate = new Date().toISOString().split('T')[0];
    if (this.courseId) {
      this.courseService.getCourseById(this.courseId).subscribe({
        next: (course) => this.course = course
      });
      this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
        next: (assignments) => this.assignments = assignments
      });
      this.loadEnrollmentStatus();
      if (this.role === 'faculty' || this.role === 'admin') {
        this.loadEnrolledStudents();
      }
    }
  }

  loadEnrollmentStatus(): void {
    if (this.role === 'student') {
      this.enrollmentService.getMyEnrollments().subscribe({
        next: (enrollments) => {
          this.isEnrolled = enrollments.some(e => {
            const cId = typeof e.courseId === 'object' ? e.courseId._id : e.courseId;
            return cId === this.courseId;
          });
        }
      });
    }
  }

  loadEnrolledStudents(): void {
    this.enrollmentService.getEnrolledStudents(this.courseId).subscribe({
      next: (students) => this.enrolledStudents = students
    });
  }

  enroll(): void {
    this.successMsg = '';
    this.errorMsg = '';
    this.enrollmentService.enroll(this.courseId).subscribe({
      next: () => {
        this.isEnrolled = true;
        this.successMsg = 'Enrolled successfully!';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => this.errorMsg = err.error?.message || 'Enrollment failed'
    });
  }

  unenroll(): void {
    this.successMsg = '';
    this.errorMsg = '';
    this.enrollmentService.unenroll(this.courseId).subscribe({
      next: () => {
        this.isEnrolled = false;
        this.successMsg = 'Unenrolled successfully';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => this.errorMsg = err.error?.message || 'Unenroll failed'
    });
  }

  // Admin: Edit assignment
  startEditAssignment(a: Assignment): void {
    this.editingAssignmentId = a._id;
    const dueDateStr = a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '';
    this.editAssignment = { title: a.title, description: a.description, dueDate: dueDateStr };
  }

  cancelEditAssignment(): void {
    this.editingAssignmentId = null;
    this.editAssignment = { title: '', description: '', dueDate: '' };
  }

  saveEditAssignment(assignmentId: string): void {
    if (!this.editAssignment.title || !this.editAssignment.description || !this.editAssignment.dueDate) {
      this.errorMsg = 'All fields are required';
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (this.editAssignment.dueDate < today) {
      this.errorMsg = 'Due date cannot be in the past';
      return;
    }
    this.successMsg = '';
    this.errorMsg = '';
    this.adminService.updateAssignment(assignmentId, this.editAssignment).subscribe({
      next: () => {
        this.successMsg = 'Assignment updated successfully';
        this.editingAssignmentId = null;
        this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
          next: (assignments) => this.assignments = assignments
        });
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => this.errorMsg = err.error?.message || 'Failed to update assignment'
    });
  }

  deleteAssignment(assignmentId: string): void {
    if (!confirm('Delete this assignment and all its submissions?')) return;
    this.successMsg = '';
    this.errorMsg = '';
    this.adminService.deleteAssignment(assignmentId).subscribe({
      next: () => {
        this.successMsg = 'Assignment deleted successfully';
        this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
          next: (assignments) => this.assignments = assignments
        });
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => this.errorMsg = err.error?.message || 'Failed to delete assignment'
    });
  }
}
