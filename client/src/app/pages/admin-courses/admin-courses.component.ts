import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
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
      <h2>All Courses</h2>
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
            <td><a [routerLink]="['/courses', course._id]">{{ course.title }}</a></td>
            <td>{{ course.description | slice:0:50 }}{{ course.description.length > 50 ? '...' : '' }}</td>
            <td>{{ course.facultyId?.name }}</td>
            <td>{{ course.createdAt | date:'mediumDate' }}</td>
            <td>
              <button class="btn btn-danger" (click)="deleteCourse(course._id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="courses.length === 0" class="empty-msg">No courses found.</p>
    </div>
  `,
  styles: [`
    .admin-courses h1 { margin: 0 0 20px; color: #1a1a2e; }
    h2 { color: #333; margin: 20px 0 12px; font-size: 1.1rem; }
    .form-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
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
    .btn-danger {
      padding: 4px 12px; background: #e94560; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.85rem;
    }
    .btn-danger:hover { background: #c62828; }
    .empty-msg { color: #999; font-style: italic; }
    .success-msg {
      background: #e0f7e0; color: #2e7d32; padding: 10px;
      border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem;
    }
    .error-msg {
      background: #ffe0e0; color: #c62828; padding: 10px;
      border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem;
    }
  `]
})
export class AdminCoursesComponent implements OnInit {
  courses: Course[] = [];
  facultyList: User[] = [];
  newCourse = { title: '', description: '', facultyId: '' };
  success = '';
  error = '';

  constructor(
    private adminService: AdminService,
    private courseService: CourseService
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

  deleteCourse(courseId: string): void {
    if (!confirm('Delete this course and all related data?')) return;
    this.success = '';
    this.error = '';
    this.adminService.deleteCourse(courseId).subscribe({
      next: () => {
        this.success = 'Course deleted successfully';
        this.loadCourses();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to delete course'
    });
  }
}
