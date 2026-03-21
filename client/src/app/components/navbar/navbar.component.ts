import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/dashboard">Smart Learning</a>
      </div>
      <div class="navbar-menu" *ngIf="user">
        <span class="navbar-user">{{ user.name }} ({{ user.role }})</span>
        <button class="btn btn-logout" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      height: 60px;
      background: #1a1a2e;
      color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .navbar-brand a {
      color: #fff;
      text-decoration: none;
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .navbar-user {
      font-size: 0.9rem;
      color: #ccc;
    }
    .btn-logout {
      padding: 6px 16px;
      border: 1px solid #e94560;
      background: transparent;
      color: #e94560;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: #e94560;
      color: #fff;
    }
  `]
})
export class NavbarComponent {
  user: User | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => this.user = user);
  }

  logout(): void {
    this.authService.logout();
  }
}
