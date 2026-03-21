import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Submission {
  _id: string;
  assignmentId: string | { _id: string; title: string; description?: string; dueDate?: string; courseId?: string };
  studentId: string | { _id: string; name: string; email: string };
  fileUrl: string;
  originalName: string;
  marks: number | null;
  feedback: string;
  submittedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private apiUrl = 'http://localhost:5000/api/submissions';

  constructor(private http: HttpClient) {}

  submitAssignment(assignmentId: string, file: File): Observable<Submission> {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);
    return this.http.post<Submission>(this.apiUrl, formData);
  }

  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/my`);
  }

  getSubmissionsByAssignment(assignmentId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/assignment/${assignmentId}`);
  }

  gradeSubmission(id: string, data: { marks: number; feedback: string }): Observable<Submission> {
    return this.http.put<Submission>(`${this.apiUrl}/${id}/grade`, data);
  }

  downloadFile(submissionId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${submissionId}/download`, {
      responseType: 'blob'
    });
  }
}
