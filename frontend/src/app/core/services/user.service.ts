import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CreateUserRequest, UpdateUserRequest, User, UserSummary } from '../models/auth.models';
import { ApiErrorService } from './api-error.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly apiErrors: ApiErrorService
  ) {}

  getUsers(): Observable<User[]> {
    return this.apiErrors.withHandling(
      this.http.get<User[]>(`${API_BASE_URL}/users`),
      'Users could not be loaded.'
    );
  }

  getUser(id: number): Observable<User> {
    return this.apiErrors.withHandling(
      this.http.get<User>(`${API_BASE_URL}/users/${id}`),
      'Profile could not be loaded.'
    );
  }

  getActiveUsers(): Observable<UserSummary[]> {
    return this.apiErrors.withHandling(
      this.http.get<UserSummary[]>(`${API_BASE_URL}/users/active`),
      'Users could not be loaded.'
    );
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.apiErrors.withHandling(
      this.http.post<User>(`${API_BASE_URL}/users`, request),
      'User could not be saved.'
    );
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.apiErrors.withHandling(
      this.http.put<User>(`${API_BASE_URL}/users/${id}`, request),
      'User could not be saved.'
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.apiErrors.withHandling(
      this.http.delete<void>(`${API_BASE_URL}/users/${id}`),
      'User could not be deleted.'
    );
  }
}
