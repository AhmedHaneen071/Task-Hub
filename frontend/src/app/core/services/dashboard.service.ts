import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { DashboardData } from '../models/project.models';
import { ApiErrorService } from './api-error.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private readonly http: HttpClient,
    private readonly apiErrors: ApiErrorService
  ) {}

  getDashboard(): Observable<DashboardData> {
    return this.apiErrors.withHandling(
      this.http.get<DashboardData>(`${API_BASE_URL}/dashboard`),
      'Dashboard data could not be loaded.'
    );
  }
}
