import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from './course.service';

export interface Enrollment {
  _id: string;
  studentId: { _id: string; name: string; email: string } | string;
  courseId: Course | string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private apiUrl = 'http://localhost:5000/api/enrollments';

  constructor(private http: HttpClient) {}

  enroll(courseId: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.apiUrl, { courseId });
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/my`);
  }

  getEnrolledStudents(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/course/${courseId}`);
  }

  unenroll(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/course/${courseId}`);
  }
}
