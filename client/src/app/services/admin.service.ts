import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth.service';
import { Course } from './course.service';

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalAssignments: number;
  totalSubmissions: number;
  totalEnrollments: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  recentUsers: any[];
  courseDetails: any[];
  recentSubmissions: any[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  updateUserRole(id: string, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  createCourse(data: { title: string; description: string; facultyId: string }): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, data);
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`);
  }
}
