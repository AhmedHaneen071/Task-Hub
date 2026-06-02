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
import { ApiErrorService } from './api-error.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(
    private readonly http: HttpClient,
    private readonly apiErrors: ApiErrorService
  ) {}

  getProjects(): Observable<Project[]> {
    return this.apiErrors.withHandling(
      this.http.get<Project[]>(`${API_BASE_URL}/projects`),
      'Projects could not be loaded.'
    );
  }

  getProject(id: number): Observable<ProjectDetail> {
    return this.apiErrors.withHandling(
      this.http.get<ProjectDetail>(`${API_BASE_URL}/projects/${id}`),
      'Project could not be loaded.'
    );
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    return this.apiErrors.withHandling(
      this.http.post<Project>(`${API_BASE_URL}/projects`, request),
      'Project could not be saved.'
    );
  }

  updateProject(id: number, request: UpdateProjectRequest): Observable<Project> {
    return this.apiErrors.withHandling(
      this.http.put<Project>(`${API_BASE_URL}/projects/${id}`, request),
      'Project could not be saved.'
    );
  }

  deleteProject(id: number): Observable<void> {
    return this.apiErrors.withHandling(
      this.http.delete<void>(`${API_BASE_URL}/projects/${id}`),
      'Project could not be deleted.'
    );
  }
}
