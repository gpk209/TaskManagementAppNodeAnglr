import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Task } from '../models/todoitem';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

  baseUrl = environment.apiUrl + 'tasks';

  constructor(private http: HttpClient) { }

  /**
   * Get all tasks for the authenticated user
   * Note: Token is automatically added by authInterceptor
   */
  GetTasks(): Observable<Task[]> {
    return this.http.get<any[]>(this.baseUrl, {
      withCredentials: true  // Send cookies for session
    }).pipe(
      map((response: any[]) => response.map((t: any) => Task.fromApiResponse(t)))
    );
  }

  /**
   * Create a new task
   */
  CreateNew(task: Task): Observable<Task> {
    return this.http.post<any>(this.baseUrl, task.toApiRequest(), {
      withCredentials: true
    }).pipe(
      map((t: any) => Task.fromApiResponse(t))
    );
  }

  /**
   * Update an existing task
   */
  Edit(task: Task): Observable<any> {
    return this.http.put(this.baseUrl + '/' + task.id, task.toApiRequest(), {
      withCredentials: true
    });
  }

  /**
   * Delete a task
   */
  Remove(task: Task): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + task.id, {
      withCredentials: true
    });
  }
}
