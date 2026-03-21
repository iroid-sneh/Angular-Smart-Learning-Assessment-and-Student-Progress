import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SubmissionService, Submission } from '../../services/submission.service';
import { AssignmentService, Assignment } from '../../services/assignment.service';

@Component({
  selector: 'app-view-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="submissions-page">
      <h1>Submissions</h1>
      <div class="assignment-info" *ngIf="assignment">
        <h3>{{ assignment.title }}</h3>
        <p>{{ assignment.description }}</p>
      </div>

      <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
      <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

      <table class="submissions-table" *ngIf="submissions.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Email</th>
            <th>File</th>
            <th>Submitted</th>
            <th>Marks</th>
            <th>Feedback</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of submissions; let i = index">
            <td>{{ i + 1 }}</td>
            <td>{{ getStudentName(s) }}</td>
            <td>{{ getStudentEmail(s) }}</td>
            <td>
              <div class="file-actions">
                <span class="file-name">{{ s.originalName || s.fileUrl }}</span>
                <div class="file-btns">
                  <button class="btn-file view" (click)="viewFile(s)" title="View file">View</button>
                  <button class="btn-file download" (click)="downloadFile(s)" title="Download file">Download</button>
                </div>
              </div>
            </td>
            <td>{{ s.submittedAt | date:'medium' }}</td>
            <td>
              <input
                type="number"
                [(ngModel)]="gradeData[s._id].marks"
                [name]="'marks_' + s._id"
                min="0" max="100"
                class="marks-input"
                placeholder="0-100"
              >
            </td>
            <td>
              <input
                type="text"
                [(ngModel)]="gradeData[s._id].feedback"
                [name]="'feedback_' + s._id"
                class="feedback-input"
                placeholder="Feedback"
              >
            </td>
            <td>
              <button class="btn-grade" (click)="grade(s._id)">
                {{ s.marks !== null ? 'Update' : 'Grade' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="submissions.length === 0" class="empty-msg">No submissions yet.</p>
    </div>
  `,
  styles: [`
    .submissions-page h1 { margin: 0 0 16px; color: #1a1a2e; }
    .assignment-info {
      background: #f8f9fa; padding: 16px; border-radius: 8px;
      margin-bottom: 20px; border-left: 4px solid #1a1a2e;
    }
    .assignment-info h3 { margin: 0 0 4px; color: #1a1a2e; }
    .assignment-info p { margin: 0; color: #666; font-size: 0.9rem; }
    .submissions-table { width: 100%; border-collapse: collapse; background: #fff; }
    .submissions-table th, .submissions-table td {
      padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.85rem;
    }
    .submissions-table th { background: #f8f9fa; color: #333; font-weight: 600; }
    .file-actions { display: flex; flex-direction: column; gap: 4px; }
    .file-name {
      font-size: 0.82rem; color: #555; word-break: break-all;
      max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      display: block;
    }
    .file-btns { display: flex; gap: 6px; }
    .btn-file {
      padding: 3px 10px; border: none; border-radius: 3px;
      font-size: 0.78rem; cursor: pointer; color: #fff;
    }
    .btn-file.view { background: #1565c0; }
    .btn-file.view:hover { background: #0d47a1; }
    .btn-file.download { background: #2e7d32; }
    .btn-file.download:hover { background: #1b5e20; }
    .marks-input { width: 70px; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; }
    .feedback-input { width: 120px; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; }
    .btn-grade {
      padding: 4px 12px; background: #2e7d32; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.85rem;
    }
    .btn-grade:hover { background: #1b5e20; }
    .empty-msg { color: #999; font-style: italic; }
    .success-msg {
      background: #e0f7e0; color: #2e7d32; padding: 10px;
      border-radius: 4px; margin-bottom: 12px; font-size: 0.9rem;
    }
    .error-msg {
      background: #ffe0e0; color: #c62828; padding: 10px;
      border-radius: 4px; margin-bottom: 12px; font-size: 0.9rem;
    }
  `]
})
export class ViewSubmissionsComponent implements OnInit {
  submissions: Submission[] = [];
  assignment: Assignment | null = null;
  assignmentId = '';
  gradeData: { [id: string]: { marks: number | null; feedback: string } } = {};
  successMsg = '';
  errorMsg = '';

  constructor(
    private submissionService: SubmissionService,
    private assignmentService: AssignmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.assignmentId = this.route.snapshot.queryParamMap.get('assignmentId') || '';
    if (this.assignmentId) {
      this.assignmentService.getAssignmentById(this.assignmentId).subscribe({
        next: (a) => this.assignment = a
      });
      this.loadSubmissions();
    }
  }

  loadSubmissions(): void {
    this.submissionService.getSubmissionsByAssignment(this.assignmentId).subscribe({
      next: (subs) => {
        this.submissions = subs;
        subs.forEach(s => {
          this.gradeData[s._id] = {
            marks: s.marks,
            feedback: s.feedback || ''
          };
        });
      }
    });
  }

  viewFile(s: Submission): void {
    // Open the file in a new tab via the static uploads URL
    window.open(`http://localhost:5000/uploads/${s.fileUrl}`, '_blank');
  }

  downloadFile(s: Submission): void {
    this.submissionService.downloadFile(s._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = s.originalName || s.fileUrl;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMsg = 'Failed to download file';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

  grade(submissionId: string): void {
    const data = this.gradeData[submissionId];
    if (data.marks === null || data.marks === undefined) {
      this.errorMsg = 'Please enter marks';
      return;
    }
    this.successMsg = '';
    this.errorMsg = '';
    this.submissionService.gradeSubmission(submissionId, {
      marks: data.marks,
      feedback: data.feedback
    }).subscribe({
      next: () => {
        this.successMsg = 'Graded successfully!';
        this.loadSubmissions();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => this.errorMsg = err.error?.message || 'Grading failed'
    });
  }

  getStudentName(s: Submission): string {
    return typeof s.studentId === 'object' ? s.studentId.name : s.studentId;
  }

  getStudentEmail(s: Submission): string {
    return typeof s.studentId === 'object' ? s.studentId.email : '';
  }
}
