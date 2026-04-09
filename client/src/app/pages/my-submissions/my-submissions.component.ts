import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionService, Submission } from '../../services/submission.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-submissions">
      <div class="page-header">
        <h1>My Submissions</h1>
        <div class="export-btns" *ngIf="submissions.length > 0">
          <button class="btn-export" (click)="exportCSV()">Export CSV</button>
          <button class="btn-export" (click)="exportExcel()">Export Excel</button>
        </div>
      </div>

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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { margin: 0; }
    .export-btns { display: flex; gap: 8px; }
    .btn-export {
      padding: 5px 12px; background: #00897b; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.82rem;
    }
    .btn-export:hover { background: #00695c; }
    .my-submissions h1 { color: #1a1a2e; }
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

  constructor(private submissionService: SubmissionService, private exportService: ExportService) {}

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

  exportCSV(): void {
    const data = this.submissions.map(s => ({
      assignment: this.getAssignmentTitle(s), file: s.originalName || s.fileUrl,
      submitted: new Date(s.submittedAt).toLocaleString(),
      marks: s.marks !== null ? s.marks + '/100' : 'Pending', feedback: s.feedback || '-'
    }));
    this.exportService.exportToCSV(data, 'my_submissions', { assignment: 'Assignment', file: 'File', submitted: 'Submitted', marks: 'Marks', feedback: 'Feedback' });
  }

  exportExcel(): void {
    const data = this.submissions.map(s => ({
      assignment: this.getAssignmentTitle(s), file: s.originalName || s.fileUrl,
      submitted: new Date(s.submittedAt).toLocaleString(),
      marks: s.marks !== null ? s.marks + '/100' : 'Pending', feedback: s.feedback || '-'
    }));
    this.exportService.exportToExcel(data, 'my_submissions', { assignment: 'Assignment', file: 'File', submitted: 'Submitted', marks: 'Marks', feedback: 'Feedback' });
  }
}
