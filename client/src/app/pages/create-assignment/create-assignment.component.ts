import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../services/assignment.service';

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-page">
      <h1>Create Assignment</h1>
      <div class="error-msg" *ngIf="error">{{ error }}</div>
      <div class="success-msg" *ngIf="success">{{ success }}</div>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Assignment Title</label>
          <input type="text" [(ngModel)]="title" name="title" required placeholder="Enter assignment title">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="description" name="description" required rows="4" placeholder="Enter assignment description"></textarea>
        </div>
        <div class="form-group">
          <label>Due Date</label>
          <input type="date" [(ngModel)]="dueDate" name="dueDate" required [min]="todayDate">
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="loading">
          {{ loading ? 'Creating...' : 'Create Assignment' }}
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
export class CreateAssignmentComponent implements OnInit {
  title = '';
  description = '';
  dueDate = '';
  courseId = '';
  error = '';
  success = '';
  loading = false;
  todayDate = '';

  constructor(
    private assignmentService: AssignmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.queryParamMap.get('courseId') || '';
    this.todayDate = new Date().toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (!this.title || !this.description || !this.dueDate) {
      this.error = 'Please fill in all fields';
      return;
    }
    if (this.dueDate < this.todayDate) {
      this.error = 'Due date cannot be in the past. Only today or future dates are allowed.';
      return;
    }
    if (!this.courseId) {
      this.error = 'Course ID is missing';
      return;
    }
    this.loading = true;
    this.error = '';
    this.assignmentService.createAssignment({
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      courseId: this.courseId
    }).subscribe({
      next: () => {
        this.success = 'Assignment created successfully!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/courses', this.courseId]), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create assignment';
        this.loading = false;
      }
    });
  }
}
