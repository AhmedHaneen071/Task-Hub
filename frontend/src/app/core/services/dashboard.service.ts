import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { DashboardData } from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${API_BASE_URL}/dashboard`);
  }
}
