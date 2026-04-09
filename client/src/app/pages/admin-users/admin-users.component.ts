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
                  (click)="openDeleteModal(user)"
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

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header danger">
            <h3>Delete User</h3>
            <button class="modal-close" (click)="closeDeleteModal()">&times;</button>
          </div>
          <div class="modal-body" *ngIf="deleteImpact">
            <div class="warning-banner">
              <strong>This action cannot be undone!</strong>
            </div>

            <p>You are about to permanently delete:</p>
            <div class="impact-card">
              <div class="impact-user">
                <strong>{{ deleteImpact.user.name }}</strong>
                <span class="text-muted">({{ deleteImpact.user.email }})</span>
                <span class="role-badge" [class]="deleteImpact.user.role">{{ deleteImpact.user.role }}</span>
              </div>
            </div>

            <!-- Student impact -->
            <div *ngIf="deleteImpact.user.role === 'student'" class="impact-details">
              <h4>The following data will be permanently removed:</h4>
              <ul>
                <li><strong>{{ deleteImpact.enrollments }}</strong> course enrollment(s)</li>
                <li><strong>{{ deleteImpact.submissions }}</strong> assignment submission(s)</li>
              </ul>
            </div>

            <!-- Faculty impact -->
            <div *ngIf="deleteImpact.user.role === 'faculty'" class="impact-details">
              <div *ngIf="deleteImpact.courses?.length > 0">
                <h4>This faculty owns {{ deleteImpact.courses.length }} course(s):</h4>
                <ul class="course-list">
                  <li *ngFor="let c of deleteImpact.courses">{{ c.title }}</li>
                </ul>
                <div class="impact-stats">
                  <span><strong>{{ deleteImpact.totalStudentsAffected }}</strong> enrolled student(s)</span>
                  <span><strong>{{ deleteImpact.totalAssignments }}</strong> assignment(s)</span>
                  <span><strong>{{ deleteImpact.totalSubmissions }}</strong> submission(s)</span>
                </div>

                <div class="reassign-section">
                  <h4>Reassign courses to another faculty before deleting:</h4>
                  <select [(ngModel)]="reassignFacultyId" name="reassignFaculty" class="reassign-select">
                    <option value="">-- Select Faculty --</option>
                    <option *ngFor="let f of getOtherFaculty()" [value]="f._id">{{ f.name }} ({{ f.email }})</option>
                  </select>
                  <button
                    class="btn btn-reassign"
                    [disabled]="!reassignFacultyId"
                    (click)="reassignAndDelete()"
                  >Reassign & Delete</button>
                </div>
              </div>

              <div *ngIf="deleteImpact.courses?.length === 0" class="impact-details">
                <p>This faculty has no courses assigned. Safe to delete.</p>
              </div>
            </div>
          </div>

          <div class="modal-body" *ngIf="!deleteImpact">
            <p>Loading impact analysis...</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeDeleteModal()">Cancel</button>
            <button
              *ngIf="deleteImpact && (deleteImpact.user.role === 'student' || deleteImpact.courses?.length === 0)"
              class="btn btn-danger-confirm"
              (click)="confirmDelete()"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
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
      padding: 12px 16px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.9rem;
    }
    .data-table th { background: #f8f9fa; color: #333; font-weight: 600; }
    .role-badge {
      display: inline-block; padding: 3px 10px; border-radius: 12px;
      font-size: 0.8rem; font-weight: 500;
    }
    .role-badge.student { background: #e3f2fd; color: #1565c0; }
    .role-badge.faculty { background: #f3e5f5; color: #7b1fa2; }
    .role-badge.admin { background: #fce4ec; color: #c62828; }
    .role-select { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; }
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

    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; justify-content: center;
      align-items: center; z-index: 1000;
    }
    .modal {
      background: #fff; border-radius: 12px; width: 520px; max-width: 90vw;
      max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #e0e0e0;
    }
    .modal-header.danger { background: #fce4ec; }
    .modal-header h3 { margin: 0; color: #c62828; font-size: 1.1rem; }
    .modal-close {
      background: none; border: none; font-size: 1.4rem; cursor: pointer;
      color: #999; padding: 0 4px;
    }
    .modal-close:hover { color: #333; }
    .modal-body { padding: 20px; }
    .modal-footer {
      padding: 16px 20px; border-top: 1px solid #e0e0e0;
      display: flex; justify-content: flex-end; gap: 10px;
    }
    .warning-banner {
      background: #fff3e0; color: #e65100; padding: 12px 16px; border-radius: 6px;
      margin-bottom: 16px; border-left: 4px solid #e65100; font-size: 0.9rem;
    }
    .impact-card {
      background: #f8f9fa; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;
    }
    .impact-user { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .impact-details h4 { font-size: 0.9rem; color: #333; margin: 12px 0 8px; }
    .impact-details ul { margin: 0; padding-left: 20px; font-size: 0.9rem; color: #555; }
    .impact-details ul li { margin-bottom: 4px; }
    .course-list li { color: #1a1a2e; font-weight: 500; }
    .impact-stats {
      display: flex; gap: 16px; margin-top: 8px; font-size: 0.85rem; color: #666;
    }
    .reassign-section {
      margin-top: 16px; padding: 14px; background: #e3f2fd; border-radius: 6px;
    }
    .reassign-section h4 { margin: 0 0 10px; color: #1565c0; font-size: 0.88rem; }
    .reassign-select {
      width: 100%; padding: 8px 12px; border: 1px solid #90caf9; border-radius: 4px;
      font-size: 0.9rem; margin-bottom: 10px;
    }
    .btn-reassign {
      padding: 8px 16px; background: #1565c0; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.85rem; width: 100%;
    }
    .btn-reassign:hover { background: #0d47a1; }
    .btn-reassign:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-danger-confirm {
      padding: 8px 20px; background: #c62828; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-size: 0.9rem;
    }
    .btn-danger-confirm:hover { background: #b71c1c; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  success = '';
  error = '';
  editingUserId: string | null = null;
  editUser = { name: '', email: '' };

  // Delete modal
  showDeleteModal = false;
  deleteTargetUser: User | null = null;
  deleteImpact: any = null;
  reassignFacultyId = '';

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

  // Delete modal logic
  openDeleteModal(user: User): void {
    this.deleteTargetUser = user;
    this.deleteImpact = null;
    this.reassignFacultyId = '';
    this.showDeleteModal = true;

    this.adminService.getUserDeleteImpact(user._id).subscribe({
      next: (impact) => this.deleteImpact = impact,
      error: (err) => {
        this.error = err.error?.message || 'Failed to load impact data';
        this.showDeleteModal = false;
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTargetUser = null;
    this.deleteImpact = null;
    this.reassignFacultyId = '';
  }

  getOtherFaculty(): User[] {
    return this.users.filter(u => u.role === 'faculty' && u._id !== this.deleteTargetUser?._id);
  }

  confirmDelete(): void {
    if (!this.deleteTargetUser) return;
    this.adminService.deleteUser(this.deleteTargetUser._id).subscribe({
      next: () => {
        this.success = 'User deleted successfully';
        this.closeDeleteModal();
        this.loadUsers();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => this.error = err.error?.message || 'Failed to delete user'
    });
  }

  reassignAndDelete(): void {
    if (!this.deleteTargetUser || !this.reassignFacultyId) return;
    const facultyId = this.deleteTargetUser._id;

    // Step 1: Reassign courses
    this.adminService.reassignFacultyCourses(facultyId, this.reassignFacultyId).subscribe({
      next: () => {
        // Step 2: Now delete the faculty
        this.adminService.deleteUser(facultyId).subscribe({
          next: () => {
            this.success = 'Courses reassigned and faculty deleted successfully';
            this.closeDeleteModal();
            this.loadUsers();
            setTimeout(() => this.success = '', 3000);
          },
          error: (err) => this.error = err.error?.message || 'Failed to delete user after reassignment'
        });
      },
      error: (err) => this.error = err.error?.message || 'Failed to reassign courses'
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
}
