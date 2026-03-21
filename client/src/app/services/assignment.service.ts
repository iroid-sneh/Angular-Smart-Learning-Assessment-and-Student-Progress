import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string | { _id: string; title: string };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private apiUrl = 'http://localhost:5000/api/assignments';

  constructor(private http: HttpClient) {}

  getAssignmentsByCourse(courseId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/course/${courseId}`);
  }

  getAssignmentById(id: string): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiUrl}/${id}`);
  }

  createAssignment(data: { title: string; description: string; dueDate: string; courseId: string }): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, data);
  }
}
