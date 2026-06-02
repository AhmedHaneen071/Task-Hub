import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/project.models';
import { ApiErrorService } from './api-error.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(
    private readonly http: HttpClient,
    private readonly apiErrors: ApiErrorService
  ) {}

  getTasks(projectId?: number): Observable<TaskItem[]> {
    const params = projectId ? new HttpParams().set('projectId', projectId) : undefined;
    return this.apiErrors.withHandling(
      this.http.get<TaskItem[]>(`${API_BASE_URL}/tasks`, { params }),
      'Tasks could not be loaded.'
    );
  }

  createTask(request: CreateTaskRequest): Observable<TaskItem> {
    return this.apiErrors.withHandling(
      this.http.post<TaskItem>(`${API_BASE_URL}/tasks`, request),
      'Task could not be saved.'
    );
  }

  updateTask(id: number, request: UpdateTaskRequest): Observable<TaskItem> {
    return this.apiErrors.withHandling(
      this.http.put<TaskItem>(`${API_BASE_URL}/tasks/${id}`, request),
      'Task could not be saved.'
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.apiErrors.withHandling(
      this.http.delete<void>(`${API_BASE_URL}/tasks/${id}`),
      'Task could not be deleted.'
    );
  }
}
