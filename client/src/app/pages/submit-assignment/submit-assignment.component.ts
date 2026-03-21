import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SubmissionService } from '../../services/submission.service';
import { AssignmentService, Assignment } from '../../services/assignment.service';

@Component({
  selector: 'app-submit-assignment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-page">
      <h1>Submit Assignment</h1>
      <div class="assignment-info" *ngIf="assignment">
        <h3>{{ assignment.title }}</h3>
        <p>{{ assignment.description }}</p>
        <span class="due-date">Due: {{ assignment.dueDate | date:'mediumDate' }}</span>
      </div>
      <div class="error-msg" *ngIf="error">{{ error }}</div>
      <div class="success-msg" *ngIf="success">{{ success }}</div>

      <div class="upload-section">
        <label class="upload-label" for="fileInput">
          <div class="upload-area" [class.has-file]="selectedFile">
            <div class="upload-icon">{{ selectedFile ? '&#10003;' : '&#8593;' }}</div>
            <div class="upload-text" *ngIf="!selectedFile">Click to select a file</div>
            <div class="upload-text" *ngIf="selectedFile">{{ selectedFile.name }}</div>
            <div class="upload-hint" *ngIf="!selectedFile">PDF, DOC, DOCX, TXT, PPT, XLS, ZIP, JPG, PNG (max 10MB)</div>
            <div class="upload-hint" *ngIf="selectedFile">{{ formatSize(selectedFile.size) }}</div>
          </div>
        </label>
        <input type="file" id="fileInput" (change)="onFileSelected($event)" hidden
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png">
      </div>

      <button class="btn btn-primary" (click)="onSubmit()" [disabled]="loading || !selectedFile">
        {{ loading ? 'Uploading...' : 'Submit Assignment' }}
      </button>
    </div>
  `,
  styles: [`
    .form-page { max-width: 500px; }
    .form-page h1 { margin: 0 0 20px; color: #1a1a2e; }
    .assignment-info {
      background: #f8f9fa; padding: 16px; border-radius: 8px;
      margin-bottom: 20px; border-left: 4px solid #1a1a2e;
    }
    .assignment-info h3 { margin: 0 0 4px; color: #1a1a2e; }
    .assignment-info p { margin: 0 0 4px; color: #666; font-size: 0.9rem; }
    .due-date { font-size: 0.8rem; color: #e94560; }
    .upload-section { margin-bottom: 20px; }
    .upload-label { cursor: pointer; display: block; }
    .upload-area {
      border: 2px dashed #ccc; border-radius: 8px; padding: 32px 20px;
      text-align: center; transition: all 0.2s; background: #fafafa;
    }
    .upload-area:hover { border-color: #1a1a2e; background: #f5f5f5; }
    .upload-area.has-file { border-color: #2e7d32; background: #f1f8f1; }
    .upload-icon { font-size: 2rem; margin-bottom: 8px; color: #999; }
    .upload-area.has-file .upload-icon { color: #2e7d32; }
    .upload-text { font-size: 0.95rem; color: #333; margin-bottom: 4px; }
    .upload-hint { font-size: 0.8rem; color: #999; }
    .btn-primary {
      padding: 10px 24px; background: #1a1a2e; color: #fff; border: none;
      border-radius: 4px; font-size: 1rem; cursor: pointer; width: 100%;
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
export class SubmitAssignmentComponent implements OnInit {
  selectedFile: File | null = null;
  assignmentId = '';
  assignment: Assignment | null = null;
  error = '';
  success = '';
  loading = false;

  constructor(
    private submissionService: SubmissionService,
    private assignmentService: AssignmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.assignmentId = this.route.snapshot.queryParamMap.get('assignmentId') || '';
    if (this.assignmentId) {
      this.assignmentService.getAssignmentById(this.assignmentId).subscribe({
        next: (a) => this.assignment = a
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.error = '';
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file';
      return;
    }
    if (!this.assignmentId) {
      this.error = 'Assignment ID is missing';
      return;
    }
    if (this.selectedFile.size > 10 * 1024 * 1024) {
      this.error = 'File size must be under 10MB';
      return;
    }
    this.loading = true;
    this.error = '';
    this.submissionService.submitAssignment(this.assignmentId, this.selectedFile).subscribe({
      next: () => {
        this.success = 'Assignment submitted successfully!';
        this.loading = false;
        this.selectedFile = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Submission failed';
        this.loading = false;
      }
    });
  }
}
