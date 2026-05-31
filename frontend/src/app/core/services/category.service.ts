import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${API_BASE_URL}/categories`, request);
  }

  updateCategory(id: number, request: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${API_BASE_URL}/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/categories/${id}`);
  }
}
