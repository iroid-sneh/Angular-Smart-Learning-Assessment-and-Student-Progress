import { Routes } from '@angular/router';
import { authGuard, facultyGuard, studentGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'courses', loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent) },
      { path: 'courses/:id', loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent) },
      { path: 'create-course', loadComponent: () => import('./pages/create-course/create-course.component').then(m => m.CreateCourseComponent), canActivate: [facultyGuard] },
      { path: 'create-assignment', loadComponent: () => import('./pages/create-assignment/create-assignment.component').then(m => m.CreateAssignmentComponent), canActivate: [facultyGuard] },
      { path: 'submit-assignment', loadComponent: () => import('./pages/submit-assignment/submit-assignment.component').then(m => m.SubmitAssignmentComponent), canActivate: [studentGuard] },
      { path: 'view-submissions', loadComponent: () => import('./pages/view-submissions/view-submissions.component').then(m => m.ViewSubmissionsComponent), canActivate: [facultyGuard] },
      { path: 'my-submissions', loadComponent: () => import('./pages/my-submissions/my-submissions.component').then(m => m.MySubmissionsComponent), canActivate: [studentGuard] },
      // Admin routes
      { path: 'admin/dashboard', loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [adminGuard] },
      { path: 'admin/users', loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent), canActivate: [adminGuard] },
      { path: 'admin/courses', loadComponent: () => import('./pages/admin-courses/admin-courses.component').then(m => m.AdminCoursesComponent), canActivate: [adminGuard] },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
