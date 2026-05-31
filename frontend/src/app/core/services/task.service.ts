import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private readonly http: HttpClient) {}

  getTasks(projectId?: number): Observable<TaskItem[]> {
    const params = projectId ? new HttpParams().set('projectId', projectId) : undefined;
    return this.http.get<TaskItem[]>(`${API_BASE_URL}/tasks`, { params });
  }

  createTask(request: CreateTaskRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${API_BASE_URL}/tasks`, request);
  }

  updateTask(id: number, request: UpdateTaskRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${API_BASE_URL}/tasks/${id}`, request);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/tasks/${id}`);
  }
}
