import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Task Interface
export interface Task {
  id: number;
  created_at: string;
  entity_name: string;
  task_type: string;
  time_of_task: string;
  contact_person: string;
  note: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:5000/tasks'; // Flask API URL

  constructor(private http: HttpClient) {}

  // Get all tasks with optional filters and sorting
  getTasks(filter: Partial<Task> = {}, sortBy: string = 'entity_name'): Observable<Task[]> {
    let params = new HttpParams().set('sort_by', sortBy);

    if (filter.contact_person) {
      params = params.set('contact_person', filter.contact_person);
    }
    if (filter.task_type) {
      params = params.set('task_type', filter.task_type);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }

    return this.http.get<Task[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new task
  createTask(task: Partial<Task>): Observable<any> {
    return this.http.post(this.apiUrl, task).pipe(catchError(this.handleError));
  }

  // Update an existing task
  updateTask(taskId: number, task: Partial<Task>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}`, task).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a task
  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Handle HTTP Errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error(error.error?.message || 'Something went wrong.'));
  }
}
