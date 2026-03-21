import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionService, Submission } from '../../services/submission.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-submissions">
      <h1>My Submissions</h1>

      <table class="data-table" *ngIf="submissions.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Assignment</th>
            <th>File</th>
            <th>Submitted</th>
            <th>Marks</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of submissions; let i = index">
            <td>{{ i + 1 }}</td>
            <td>{{ getAssignmentTitle(s) }}</td>
            <td>
              <span class="file-name">{{ s.originalName || s.fileUrl }}</span>
              <button class="btn-dl" (click)="downloadFile(s)">Download</button>
            </td>
            <td>{{ s.submittedAt | date:'medium' }}</td>
            <td>
              <span *ngIf="s.marks !== null" class="marks-badge">{{ s.marks }}/100</span>
              <span *ngIf="s.marks === null" class="pending-badge">Pending</span>
            </td>
            <td>{{ s.feedback || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="submissions.length === 0" class="empty-msg">No submissions yet.</p>
    </div>
  `,
  styles: [`
    .my-submissions h1 { margin: 0 0 20px; color: #1a1a2e; }
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table th, .data-table td {
      padding: 12px 16px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.9rem;
    }
    .data-table th { background: #f8f9fa; color: #333; font-weight: 600; }
    .data-table td a { color: #1a1a2e; }
    .file-name { font-size: 0.82rem; color: #555; display: block; margin-bottom: 4px; }
    .btn-dl {
      padding: 2px 10px; background: #2e7d32; color: #fff; border: none;
      border-radius: 3px; font-size: 0.78rem; cursor: pointer;
    }
    .btn-dl:hover { background: #1b5e20; }
    .marks-badge {
      display: inline-block; padding: 2px 8px; background: #e0f7e0;
      color: #2e7d32; border-radius: 8px; font-size: 0.85rem; font-weight: 600;
    }
    .pending-badge {
      display: inline-block; padding: 2px 8px; background: #fff3e0;
      color: #e65100; border-radius: 8px; font-size: 0.85rem;
    }
    .empty-msg { color: #999; font-style: italic; }
  `]
})
export class MySubmissionsComponent implements OnInit {
  submissions: Submission[] = [];

  constructor(private submissionService: SubmissionService) {}

  ngOnInit(): void {
    this.submissionService.getMySubmissions().subscribe({
      next: (subs) => this.submissions = subs
    });
  }

  getAssignmentTitle(s: Submission): string {
    return typeof s.assignmentId === 'object' ? s.assignmentId.title : s.assignmentId;
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
      }
    });
  }
}
