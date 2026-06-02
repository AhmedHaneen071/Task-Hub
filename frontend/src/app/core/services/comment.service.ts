import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CommentItem, CreateCommentRequest, UpdateCommentRequest } from '../models/project.models';
import { ApiErrorService } from './api-error.service';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(
    private readonly http: HttpClient,
    private readonly apiErrors: ApiErrorService
  ) {}

  getComments(taskId?: number): Observable<CommentItem[]> {
    const params = taskId ? new HttpParams().set('taskId', taskId) : undefined;
    return this.apiErrors.withHandling(
      this.http.get<CommentItem[]>(`${API_BASE_URL}/comments`, { params }),
      'Comments could not be loaded.'
    );
  }

  createComment(request: CreateCommentRequest): Observable<CommentItem> {
    return this.apiErrors.withHandling(
      this.http.post<CommentItem>(`${API_BASE_URL}/comments`, request),
      'Comment could not be saved.'
    );
  }

  updateComment(id: number, request: UpdateCommentRequest): Observable<CommentItem> {
    return this.apiErrors.withHandling(
      this.http.put<CommentItem>(`${API_BASE_URL}/comments/${id}`, request),
      'Comment could not be saved.'
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.apiErrors.withHandling(
      this.http.delete<void>(`${API_BASE_URL}/comments/${id}`),
      'Comment could not be deleted.'
    );
  }
}
