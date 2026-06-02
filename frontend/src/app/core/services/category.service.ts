import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/project.models';
import { ApiErrorService } from './api-error.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(
    private readonly http: HttpClient,
    private readonly apiErrors: ApiErrorService
  ) {}

  getCategories(): Observable<Category[]> {
    return this.apiErrors.withHandling(
      this.http.get<Category[]>(`${API_BASE_URL}/categories`),
      'Categories could not be loaded.'
    );
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.apiErrors.withHandling(
      this.http.post<Category>(`${API_BASE_URL}/categories`, request),
      'Category could not be saved.'
    );
  }

  updateCategory(id: number, request: UpdateCategoryRequest): Observable<Category> {
    return this.apiErrors.withHandling(
      this.http.put<Category>(`${API_BASE_URL}/categories/${id}`, request),
      'Category could not be saved.'
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.apiErrors.withHandling(
      this.http.delete<void>(`${API_BASE_URL}/categories/${id}`),
      'Category could not be deleted.'
    );
  }
}
