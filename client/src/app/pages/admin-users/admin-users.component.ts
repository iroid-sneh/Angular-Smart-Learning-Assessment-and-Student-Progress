import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ExportService } from '../../services/export.service';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users">
      <div class="page-header">
        <h1>Manage Users</h1>
        <div class="export-btns" *ngIf="users.length > 0">
          <button class="btn btn-export" (click)="exportCSV()">Export CSV</button>
          <button class="btn btn-export" (click)="exportExcel()">Export Excel</button>
        </div>
      </div>
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
            <td>
              <span *ngIf="editingUserId !== user._id">{{ user.name }}</span>
              <input *ngIf="editingUserId === user._id" type="text" [(ngModel)]="editUser.name" [name]="'name_'+user._id" class="edit-input">
            </td>
            <td>
              <span *ngIf="editingUserId !== user._id">{{ user.email }}</span>
              <input *ngIf="editingUserId === user._id" type="email" [(ngModel)]="editUser.email" [name]="'email_'+user._id" class="edit-input">
            </td>
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
            <td class="action-btns">
              <ng-container *ngIf="editingUserId !== user._id">
                <button class="btn btn-edit" (click)="startEdit(user)">Edit</button>
                <button
                  *ngIf="user.role !== 'admin'"
                  class="btn btn-danger"
                  (click)="deleteUser(user._id)"
                >Delete</button>
                <span *ngIf="user.role === 'admin'" class="text-muted">-</span>
              </ng-container>
              <ng-container *ngIf="editingUserId === user._id">
                <button class="btn btn-save" (click)="saveEdit(user._id)">Save</button>
                <button class="btn btn-cancel" (click)="cancelEdit()">Cancel</button>
              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="users.length === 0" class="empty-msg">No users found.</p>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { margin: 0; }
    .export-btns { display: flex; gap: 8px; }
    .btn-export {
      padding: 6px 14px; background: #00897b; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.85rem;
    }
    .btn-export:hover { background: #00695c; }
    .admin-users h1 { color: #1a1a2e; }
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
    .action-btns { display: flex; gap: 6px; align-items: center; }
    .btn { padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .btn-edit { background: #1565c0; color: #fff; }
    .btn-edit:hover { background: #0d47a1; }
    .btn-save { background: #2e7d32; color: #fff; }
    .btn-save:hover { background: #1b5e20; }
    .btn-cancel { background: #757575; color: #fff; }
    .btn-cancel:hover { background: #616161; }
    .btn-danger { background: #e94560; color: #fff; }
    .btn-danger:hover { background: #c62828; }
    .edit-input {
      padding: 4px 8px; border: 1px solid #1565c0; border-radius: 4px;
      font-size: 0.85rem; width: 100%; box-sizing: border-box;
    }
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
  editingUserId: string | null = null;
  editUser = { name: '', email: '' };

  constructor(private adminService: AdminService, private exportService: ExportService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: () => this.error = 'Failed to load users'
    });
  }

  startEdit(user: User): void {
    this.editingUserId = user._id;
    this.editUser = { name: user.name, email: user.email };
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editUser = { name: '', email: '' };
  }

  saveEdit(userId: string): void {
    if (!this.editUser.name || !this.editUser.email) {
      this.error = 'Name and email are required';
      return;
    }
    this.success = '';
    this.error = '';
    this.adminService.updateUser(userId, this.editUser).subscribe({
      next: () => {
        this.success = 'User updated successfully';
        this.editingUserId = null;
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to update user'
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

  exportCSV(): void {
    const data = this.users.map(u => ({ name: u.name, email: u.email, role: u.role }));
    this.exportService.exportToCSV(data, 'users', { name: 'Name', email: 'Email', role: 'Role' });
  }

  exportExcel(): void {
    const data = this.users.map(u => ({ name: u.name, email: u.email, role: u.role }));
    this.exportService.exportToExcel(data, 'users', { name: 'Name', email: 'Email', role: 'Role' });
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
