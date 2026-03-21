import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users">
      <h1>Manage Users</h1>
      <div class="success-msg" *ngIf="success">{{ success }}</div>
      <div class="error-msg" *ngIf="error">{{ error }}</div>

      <table class="data-table" *ngIf="users.length > 0">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users; let i = index">
            <td>{{ i + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td><span class="role-badge" [class]="user.role">{{ user.role }}</span></td>
            <td>
              <select
                *ngIf="user.role !== 'admin'"
                [ngModel]="user.role"
                (ngModelChange)="changeRole(user._id, $event)"
                class="role-select"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              <span *ngIf="user.role === 'admin'" class="text-muted">-</span>
            </td>
            <td>
              <button
                *ngIf="user.role !== 'admin'"
                class="btn btn-danger"
                (click)="deleteUser(user._id)"
              >Delete</button>
              <span *ngIf="user.role === 'admin'" class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="users.length === 0" class="empty-msg">No users found.</p>
    </div>
  `,
  styles: [`
    .admin-users h1 { margin: 0 0 20px; color: #1a1a2e; }
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
      font-size: 0.9rem;
    }
    .data-table th { background: #f8f9fa; color: #333; font-weight: 600; }
    .role-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .role-badge.student { background: #e3f2fd; color: #1565c0; }
    .role-badge.faculty { background: #f3e5f5; color: #7b1fa2; }
    .role-badge.admin { background: #fce4ec; color: #c62828; }
    .role-select {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .btn-danger {
      padding: 4px 12px;
      background: #e94560;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-danger:hover { background: #c62828; }
    .text-muted { color: #999; }
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
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  success = '';
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: () => this.error = 'Failed to load users'
    });
  }

  changeRole(userId: string, newRole: string): void {
    this.success = '';
    this.error = '';
    this.adminService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this.success = 'Role updated successfully';
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to update role'
    });
  }

  deleteUser(userId: string): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.success = '';
    this.error = '';
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.success = 'User deleted successfully';
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to delete user'
    });
  }
}
