import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, DashboardStats } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard" *ngIf="stats">
      <h1>Admin Analytics Dashboard</h1>

      <!-- Overview Stats -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card teal">
          <div class="stat-number">{{ stats.totalStudents }}</div>
          <div class="stat-label">Students</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-number">{{ stats.totalFaculty }}</div>
          <div class="stat-label">Faculty</div>
        </div>
        <div class="stat-card navy">
          <div class="stat-number">{{ stats.totalCourses }}</div>
          <div class="stat-label">Courses</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-number">{{ stats.totalAssignments }}</div>
          <div class="stat-label">Assignments</div>
        </div>
        <div class="stat-card green">
          <div class="stat-number">{{ stats.totalEnrollments }}</div>
          <div class="stat-label">Enrollments</div>
        </div>
      </div>

      <!-- Submission Analytics -->
      <div class="section">
        <h2>Submission Analytics</h2>
        <div class="analytics-row">
          <div class="analytics-card">
            <div class="analytics-header">Total Submissions</div>
            <div class="analytics-value">{{ stats.totalSubmissions }}</div>
            <div class="progress-bar">
              <div class="progress-fill graded" [style.width.%]="getGradedPercent()"></div>
            </div>
            <div class="progress-labels">
              <span class="label-graded">Graded: {{ stats.gradedSubmissions }}</span>
              <span class="label-pending">Pending: {{ stats.pendingSubmissions }}</span>
            </div>
          </div>
          <div class="analytics-card">
            <div class="analytics-header">Grading Rate</div>
            <div class="analytics-value large">{{ getGradedPercent() | number:'1.0-0' }}%</div>
            <div class="analytics-sub">of all submissions have been graded</div>
          </div>
          <div class="analytics-card">
            <div class="analytics-header">Avg Enrollments/Course</div>
            <div class="analytics-value large">{{ getAvgEnrollments() | number:'1.0-1' }}</div>
            <div class="analytics-sub">students per course</div>
          </div>
        </div>
      </div>

      <!-- All Courses Table -->
      <div class="section">
        <h2>All Courses Overview</h2>
        <table class="data-table" *ngIf="stats?.courseDetails?.length">
          <thead>
            <tr>
              <th>#</th>
              <th>Course Title</th>
              <th>Faculty</th>
              <th>Students</th>
              <th>Assignments</th>
              <th>Submissions</th>
              <th>Graded</th>
              <th>Pending</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of stats.courseDetails; let i = index">
              <td>{{ i + 1 }}</td>
              <td><a [routerLink]="['/courses', c._id]" class="link">{{ c.title }}</a></td>
              <td>{{ c.facultyName }}</td>
              <td>{{ c.enrollmentCount }}</td>
              <td>{{ c.assignmentCount }}</td>
              <td>{{ c.submissionCount }}</td>
              <td><span class="status graded">{{ c.gradedCount }}</span></td>
              <td><span class="status pending" *ngIf="c.submissionCount - c.gradedCount > 0">{{ c.submissionCount - c.gradedCount }}</span><span *ngIf="c.submissionCount - c.gradedCount === 0">0</span></td>
              <td>{{ c.createdAt | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="stats.courseDetails?.length === 0" class="empty-msg">No courses yet.</p>
      </div>

      <!-- Recent Submissions -->
      <div class="section">
        <h2>Recent Submissions</h2>
        <table class="data-table" *ngIf="stats?.recentSubmissions?.length">
          <thead>
            <tr>
              <th>Student</th>
              <th>Assignment</th>
              <th>File</th>
              <th>Submitted</th>
              <th>Marks</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of stats.recentSubmissions">
              <td>{{ s.studentId?.name || '-' }}</td>
              <td>{{ s.assignmentId?.title || '-' }}</td>
              <td><a [href]="s.fileUrl" target="_blank" class="link">View</a></td>
              <td>{{ s.submittedAt | date:'short' }}</td>
              <td>
                <span class="status graded" *ngIf="s.marks !== null">{{ s.marks }}/100</span>
                <span class="status pending" *ngIf="s.marks === null">Pending</span>
              </td>
              <td>{{ s.feedback || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="stats.recentSubmissions?.length === 0" class="empty-msg">No submissions yet.</p>
      </div>

      <!-- Recent Users -->
      <div class="section">
        <h2>Recently Registered Users</h2>
        <table class="data-table" *ngIf="stats?.recentUsers?.length">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of stats.recentUsers; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td><span class="role-badge" [class]="u.role">{{ u.role }}</span></td>
              <td>{{ u.createdAt | date:'medium' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2>Quick Actions</h2>
        <div class="link-grid">
          <a routerLink="/admin/users" class="quick-link">Manage Users</a>
          <a routerLink="/admin/courses" class="quick-link">Manage Courses</a>
          <a routerLink="/courses" class="quick-link">Browse Courses</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard h1 { margin: 0 0 24px; color: #1a1a2e; }
    h2 { color: #333; margin: 0 0 14px; font-size: 1.15rem; }
    .section { margin-bottom: 32px; }

    /* Stats Grid */
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 14px; margin-bottom: 32px;
    }
    .stat-card {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
      padding: 20px; text-align: center; border-top: 3px solid #e0e0e0;
    }
    .stat-card.blue { border-top-color: #1565c0; }
    .stat-card.teal { border-top-color: #00897b; }
    .stat-card.purple { border-top-color: #7b1fa2; }
    .stat-card.navy { border-top-color: #1a1a2e; }
    .stat-card.orange { border-top-color: #e65100; }
    .stat-card.green { border-top-color: #2e7d32; }
    .stat-number { font-size: 2rem; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 0.82rem; color: #888; margin-top: 4px; }

    /* Analytics */
    .analytics-row {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;
    }
    .analytics-card {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;
    }
    .analytics-header { font-size: 0.85rem; color: #888; margin-bottom: 8px; }
    .analytics-value { font-size: 1.4rem; font-weight: 700; color: #1a1a2e; }
    .analytics-value.large { font-size: 2.2rem; }
    .analytics-sub { font-size: 0.8rem; color: #999; margin-top: 4px; }
    .progress-bar {
      height: 8px; background: #f0f0f0; border-radius: 4px; margin: 12px 0 8px; overflow: hidden;
    }
    .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
    .progress-fill.graded { background: #2e7d32; }
    .progress-labels { display: flex; justify-content: space-between; font-size: 0.78rem; }
    .label-graded { color: #2e7d32; }
    .label-pending { color: #e65100; }

    /* Tables */
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table th, .data-table td {
      padding: 10px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 0.85rem;
    }
    .data-table th { background: #fafafa; color: #555; font-weight: 600; }
    .link { color: #1a1a2e; text-decoration: underline; }

    .status {
      display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 500;
    }
    .status.graded { background: #e0f7e0; color: #2e7d32; }
    .status.pending { background: #fff3e0; color: #e65100; }

    .role-badge {
      display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.78rem; font-weight: 500;
    }
    .role-badge.student { background: #e3f2fd; color: #1565c0; }
    .role-badge.faculty { background: #f3e5f5; color: #7b1fa2; }
    .role-badge.admin { background: #fce4ec; color: #c62828; }

    .link-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .quick-link {
      padding: 10px 20px; background: #1a1a2e; color: #fff; border-radius: 6px;
      text-decoration: none; font-size: 0.9rem; transition: background 0.2s;
    }
    .quick-link:hover { background: #16213e; }
    .empty-msg { color: #999; font-style: italic; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (stats) => this.stats = stats
    });
  }

  getGradedPercent(): number {
    if (!this.stats || this.stats.totalSubmissions === 0) return 0;
    return (this.stats.gradedSubmissions / this.stats.totalSubmissions) * 100;
  }

  getAvgEnrollments(): number {
    if (!this.stats || this.stats.totalCourses === 0) return 0;
    return this.stats.totalEnrollments / this.stats.totalCourses;
  }
}
