import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-page">
      <h1>Create Course</h1>
      <div class="error-msg" *ngIf="error">{{ error }}</div>
      <div class="success-msg" *ngIf="success">{{ success }}</div>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Course Title</label>
          <input type="text" [(ngModel)]="title" name="title" required placeholder="Enter course title">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="description" name="description" required rows="4" placeholder="Enter course description"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="loading">
          {{ loading ? 'Creating...' : 'Create Course' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-page { max-width: 500px; }
    .form-page h1 { margin: 0 0 20px; color: #1a1a2e; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 0.9rem; color: #555; }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.95rem;
      box-sizing: border-box;
      font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #1a1a2e; }
    .btn-primary {
      padding: 10px 24px;
      background: #1a1a2e;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    .btn-primary:hover { background: #16213e; }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .error-msg {
      background: #ffe0e0; color: #c62828; padding: 10px;
      border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem;
    }
    .success-msg {
      background: #e0f7e0; color: #2e7d32; padding: 10px;
      border-radius: 4px; margin-bottom: 16px; font-size: 0.9rem;
    }
  `]
})
export class CreateCourseComponent {
  title = '';
  description = '';
  error = '';
  success = '';
  loading = false;

  constructor(private courseService: CourseService, private router: Router) {}

  onSubmit(): void {
    if (!this.title || !this.description) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    this.error = '';
    this.courseService.createCourse({ title: this.title, description: this.description }).subscribe({
      next: () => {
        this.success = 'Course created successfully!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create course';
        this.loading = false;
      }
    });
  }
}
