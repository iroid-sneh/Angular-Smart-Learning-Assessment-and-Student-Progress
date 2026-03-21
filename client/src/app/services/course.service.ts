import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  _id: string;
  title: string;
  description: string;
  facultyId: { _id: string; name: string; email: string };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = 'http://localhost:5000/api/courses';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  createCourse(data: { title: string; description: string }): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, data);
  }

  getFacultyDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/faculty/dashboard`);
  }
}
