import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CreateUserRequest, UpdateUserRequest, User, UserSummary } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_BASE_URL}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${API_BASE_URL}/users/${id}`);
  }

  getActiveUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${API_BASE_URL}/users/active`);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${API_BASE_URL}/users`, request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${API_BASE_URL}/users/${id}`, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/users/${id}`);
  }
}
