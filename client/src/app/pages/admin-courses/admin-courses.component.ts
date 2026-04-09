import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ExportService } from '../../services/export.service';
import { CourseService, Course } from '../../services/course.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-courses">
      <h1>Manage Courses</h1>
      <div class="success-msg" *ngIf="success">{{ success }}</div>
      <div class="error-msg" *ngIf="error">{{ error }}</div>

      <!-- Create Course Form -->
      <div class="form-section">
        <h2>Create New Course</h2>
        <form (ngSubmit)="createCourse()">
          <div class="form-row">
            <div class="form-group">
              <label>Title</label>
              <input type="text" [(ngModel)]="newCourse.title" name="title" required placeholder="Course title">
            </div>
            <div class="form-group">
              <label>Assign Faculty</label>
              <select [(ngModel)]="newCourse.facultyId" name="facultyId" required>
                <option value="">Select Faculty</option>
                <option *ngFor="let f of facultyList" [value]="f._id">{{ f.name }} ({{ f.email }})</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="newCourse.description" name="description" required rows="3" placeholder="Course description"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Create Course</button>
        </form>
      </div>

      <!-- Course List -->
      <div class="section-header">
        <h2>All Courses</h2>
        <div class="export-btns" *ngIf="courses.length > 0">
          <button class="btn btn-export" (click)="exportCSV()">Export CSV</button>
          <button class="btn btn-export" (click)="exportExcel()">Export Excel</button>
        </div>
      </div>
      <table class="data-table" *ngIf="courses.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Description</th>
            <th>Faculty</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let course of courses; let i = index">
            <td>{{ i + 1 }}</td>
            <td>
              <span *ngIf="editingCourseId !== course._id"><a [routerLink]="['/courses', course._id]">{{ course.title }}</a></span>
              <input *ngIf="editingCourseId === course._id" type="text" [(ngModel)]="editCourse.title" [name]="'title_'+course._id" class="edit-input">
            </td>
            <td>
              <span *ngIf="editingCourseId !== course._id">{{ course.description | slice:0:50 }}{{ course.description.length > 50 ? '...' : '' }}</span>
              <textarea *ngIf="editingCourseId === course._id" [(ngModel)]="editCourse.description" [name]="'desc_'+course._id" class="edit-textarea" rows="2"></textarea>
            </td>
            <td>
              <span *ngIf="editingCourseId !== course._id">{{ course.facultyId?.name }}</span>
              <select *ngIf="editingCourseId === course._id" [(ngModel)]="editCourse.facultyId" [name]="'faculty_'+course._id" class="edit-select">
                <option *ngFor="let f of facultyList" [value]="f._id">{{ f.name }}</option>
              </select>
            </td>
            <td>{{ course.createdAt | date:'mediumDate' }}</td>
            <td class="action-btns">
              <ng-container *ngIf="editingCourseId !== course._id">
                <button class="btn btn-edit" (click)="startEdit(course)">Edit</button>
                <button class="btn btn-danger" (click)="openDeleteModal(course)">Delete</button>
              </ng-container>
              <ng-container *ngIf="editingCourseId === course._id">
                <button class="btn btn-save" (click)="saveEdit(course._id)">Save</button>
                <button class="btn btn-cancel" (click)="cancelEdit()">Cancel</button>
              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="courses.length === 0" class="empty-msg">No courses found.</p>

      <!-- Delete Course Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header danger">
            <h3>Delete Course</h3>
            <button class="modal-close" (click)="closeDeleteModal()">&times;</button>
          </div>
          <div class="modal-body" *ngIf="deleteImpact">
            <div class="warning-banner">
              <strong>This action cannot be undone!</strong>
            </div>

            <p>You are about to permanently delete:</p>
            <div class="impact-card">
              <strong>{{ deleteImpact.course.title }}</strong>
              <span class="text-muted"> - Faculty: {{ deleteImpact.course.faculty }}</span>
            </div>

            <div class="impact-details">
              <h4>The following data will be permanently removed:</h4>
              <ul>
                <li><strong>{{ deleteImpact.enrolledStudents }}</strong> enrolled student(s) will be unenrolled</li>
                <li><strong>{{ deleteImpact.assignments }}</strong> assignment(s) will be deleted</li>
                <li><strong>{{ deleteImpact.submissions }}</strong> student submission(s) will be lost</li>
              </ul>
            </div>

            <div class="impact-summary" *ngIf="deleteImpact.enrolledStudents > 0 || deleteImpact.submissions > 0">
              <p>All enrolled students will lose access to this course and their submissions will be permanently deleted.</p>
            </div>
          </div>

          <div class="modal-body" *ngIf="!deleteImpact">
            <p>Loading impact analysis...</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeDeleteModal()">Cancel</button>
            <button
              *ngIf="deleteImpact"
              class="btn btn-danger-confirm"
              (click)="confirmDelete()"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-courses h1 { margin: 0 0 20px; color: #1a1a2e; }
    h2 { color: #333; margin: 20px 0 12px; font-size: 1.1rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; }
    .export-btns { display: flex; gap: 8px; }
    .btn-export {
      padding: 6px 14px; background: #00897b; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.85rem;
    }
    .btn-export:hover { background: #00695c; }
    .form-section {
      background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 24px;
    }
    .form-row { display: flex; gap: 16px; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 4px; font-size: 0.85rem; color: #555; }
    .form-group input, .form-group textarea, .form-group select {
      width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;
      font-size: 0.9rem; box-sizing: border-box; font-family: inherit;
    }
    .btn-primary {
      padding: 8px 20px; background: #1a1a2e; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.9rem;
    }
    .btn-primary:hover { background: #16213e; }
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table th, .data-table td {
      padding: 10px 14px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.9rem;
    }
    .data-table th { background: #f8f9fa; color: #333; font-weight: 600; }
    .data-table td a { color: #1a1a2e; font-weight: 500; }
    .action-btns { display: flex; gap: 6px; align-items: center; }
    .btn { padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .btn-edit { background: #1565c0; color: #fff; }
    .btn-edit:hover { background: #0d47a1; }
    .btn-save { background: #2e7d32; color: #fff; }
    .btn-save:hover { background: #1b5e20; }
    .btn-cancel { background: #757575; color: #fff; }
    .btn-cancel:hover { background: #616161; }
    .btn-danger {
      padding: 4px 12px; background: #e94560; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.85rem;
    }
    .btn-danger:hover { background: #c62828; }
    .edit-input {
      padding: 4px 8px; border: 1px solid #1565c0; border-radius: 4px;
      font-size: 0.85rem; width: 100%; box-sizing: border-box;
    }
    .edit-textarea {
      padding: 4px 8px; border: 1px solid #1565c0; border-radius: 4px;
      font-size: 0.85rem; width: 100%; box-sizing: border-box; font-family: inherit;
    }
    .edit-select {
      padding: 4px 8px; border: 1px solid #1565c0; border-radius: 4px; font-size: 0.85rem;
    }
    .empty-msg { color: #999; font-style: italic; }
    .text-muted { color: #999; }
    .success-msg {
      background: #e0f7e0; color: #2e7d32; padding: 10px;
      border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem;
    }
    .error-msg {
      background: #ffe0e0; color: #c62828; padding: 10px;
      border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; justify-content: center;
      align-items: center; z-index: 1000;
    }
    .modal {
      background: #fff; border-radius: 12px; width: 520px; max-width: 90vw;
      max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #e0e0e0;
    }
    .modal-header.danger { background: #fce4ec; }
    .modal-header h3 { margin: 0; color: #c62828; font-size: 1.1rem; }
    .modal-close {
      background: none; border: none; font-size: 1.4rem; cursor: pointer;
      color: #999; padding: 0 4px;
    }
    .modal-close:hover { color: #333; }
    .modal-body { padding: 20px; }
    .modal-footer {
      padding: 16px 20px; border-top: 1px solid #e0e0e0;
      display: flex; justify-content: flex-end; gap: 10px;
    }
    .warning-banner {
      background: #fff3e0; color: #e65100; padding: 12px 16px; border-radius: 6px;
      margin-bottom: 16px; border-left: 4px solid #e65100; font-size: 0.9rem;
    }
    .impact-card {
      background: #f8f9fa; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;
    }
    .impact-details h4 { font-size: 0.9rem; color: #333; margin: 12px 0 8px; }
    .impact-details ul { margin: 0; padding-left: 20px; font-size: 0.9rem; color: #555; }
    .impact-details ul li { margin-bottom: 4px; }
    .impact-summary {
      background: #fce4ec; padding: 10px 14px; border-radius: 6px;
      margin-top: 12px; font-size: 0.85rem; color: #c62828;
    }
    .impact-summary p { margin: 0; }
    .btn-danger-confirm {
      padding: 8px 20px; background: #c62828; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.9rem;
    }
    .btn-danger-confirm:hover { background: #b71c1c; }
  `]
})
export class AdminCoursesComponent implements OnInit {
  courses: Course[] = [];
  facultyList: User[] = [];
  newCourse = { title: '', description: '', facultyId: '' };
  editingCourseId: string | null = null;
  editCourse = { title: '', description: '', facultyId: '' };
  success = '';
  error = '';

  // Delete modal
  showDeleteModal = false;
  deleteTargetCourse: Course | null = null;
  deleteImpact: any = null;

  constructor(
    private adminService: AdminService,
    private courseService: CourseService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadFaculty();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => this.courses = courses
    });
  }

  loadFaculty(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.facultyList = users.filter(u => u.role === 'faculty')
    });
  }

  createCourse(): void {
    if (!this.newCourse.title || !this.newCourse.description || !this.newCourse.facultyId) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.success = '';
    this.error = '';
    this.adminService.createCourse(this.newCourse).subscribe({
      next: () => {
        this.success = 'Course created successfully';
        this.newCourse = { title: '', description: '', facultyId: '' };
        this.loadCourses();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to create course'
    });
  }

  startEdit(course: Course): void {
    this.editingCourseId = course._id;
    this.editCourse = {
      title: course.title,
      description: course.description,
      facultyId: course.facultyId?._id || ''
    };
  }

  cancelEdit(): void {
    this.editingCourseId = null;
    this.editCourse = { title: '', description: '', facultyId: '' };
  }

  saveEdit(courseId: string): void {
    if (!this.editCourse.title || !this.editCourse.description) {
      this.error = 'Title and description are required';
      return;
    }
    this.success = '';
    this.error = '';
    this.adminService.updateCourse(courseId, this.editCourse).subscribe({
      next: () => {
        this.success = 'Course updated successfully';
        this.editingCourseId = null;
        this.loadCourses();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to update course'
    });
  }

  // Delete modal logic
  openDeleteModal(course: Course): void {
    this.deleteTargetCourse = course;
    this.deleteImpact = null;
    this.showDeleteModal = true;

    this.adminService.getCourseDeleteImpact(course._id).subscribe({
      next: (impact) => this.deleteImpact = impact,
      error: (err) => {
        this.error = err.error?.message || 'Failed to load impact data';
        this.showDeleteModal = false;
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTargetCourse = null;
    this.deleteImpact = null;
  }

  confirmDelete(): void {
    if (!this.deleteTargetCourse) return;
    this.adminService.deleteCourse(this.deleteTargetCourse._id).subscribe({
      next: () => {
        this.success = 'Course deleted successfully';
        this.closeDeleteModal();
        this.loadCourses();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to delete course'
    });
  }

  exportCSV(): void {
    const data = this.courses.map(c => ({
      title: c.title, description: c.description, faculty: c.facultyId?.name || '',
      created: new Date(c.createdAt).toLocaleDateString()
    }));
    this.exportService.exportToCSV(data, 'courses', { title: 'Title', description: 'Description', faculty: 'Faculty', created: 'Created' });
  }

  exportExcel(): void {
    const data = this.courses.map(c => ({
      title: c.title, description: c.description, faculty: c.facultyId?.name || '',
      created: new Date(c.createdAt).toLocaleDateString()
    }));
    this.exportService.exportToExcel(data, 'courses', { title: 'Title', description: 'Description', faculty: 'Faculty', created: 'Created' });
  }
}
