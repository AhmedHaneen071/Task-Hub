import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import {
  CreateProjectRequest,
  Project,
  ProjectDetail,
  UpdateProjectRequest
} from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private readonly http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${API_BASE_URL}/projects`);
  }

  getProject(id: number): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${API_BASE_URL}/projects/${id}`);
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${API_BASE_URL}/projects`, request);
  }

  updateProject(id: number, request: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${API_BASE_URL}/projects/${id}`, request);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/projects/${id}`);
  }
}
