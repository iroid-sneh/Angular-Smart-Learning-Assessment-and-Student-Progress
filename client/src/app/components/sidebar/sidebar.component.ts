import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <ul class="sidebar-menu">
        <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
        <li><a routerLink="/courses" routerLinkActive="active">Courses</a></li>
        <li *ngIf="role === 'student'">
          <a routerLink="/my-submissions" routerLinkActive="active">My Submissions</a>
        </li>
        <li *ngIf="role === 'faculty'">
          <a routerLink="/create-course" routerLinkActive="active">Create Course</a>
        </li>
        <li *ngIf="role === 'admin'">
          <a routerLink="/admin/users" routerLinkActive="active">Manage Users</a>
        </li>
        <li *ngIf="role === 'admin'">
          <a routerLink="/admin/courses" routerLinkActive="active">Manage Courses</a>
        </li>
      </ul>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      min-height: calc(100vh - 60px);
      background: #f8f9fa;
      border-right: 1px solid #e0e0e0;
      padding-top: 20px;
    }
    .sidebar-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .sidebar-menu li a {
      display: block;
      padding: 12px 24px;
      color: #333;
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }
    .sidebar-menu li a:hover,
    .sidebar-menu li a.active {
      background: #e9ecef;
      color: #1a1a2e;
      border-left-color: #1a1a2e;
    }
  `]
})
export class SidebarComponent {
  role: string | null = null;

  constructor(private authService: AuthService) {
    this.role = this.authService.getRole();
  }
}
