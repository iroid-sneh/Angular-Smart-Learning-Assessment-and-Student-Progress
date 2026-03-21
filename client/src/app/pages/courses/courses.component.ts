import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="courses-page">
      <h1>All Courses</h1>
      <div class="card-grid">
        <div class="card" *ngFor="let course of courses" [routerLink]="['/courses', course._id]">
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>
          <span class="card-meta">By {{ course.facultyId?.name }}</span>
        </div>
      </div>
      <p *ngIf="courses.length === 0" class="empty-msg">No courses available.</p>
    </div>
  `,
  styles: [`
    .courses-page h1 { margin: 0 0 20px; color: #1a1a2e; }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .card h3 { margin: 0 0 8px; color: #1a1a2e; }
    .card p { margin: 0 0 12px; color: #666; font-size: 0.9rem; }
    .card-meta { font-size: 0.8rem; color: #999; }
    .empty-msg { color: #999; font-style: italic; }
  `]
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => this.courses = courses
    });
  }
}
