import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CommentItem, CreateCommentRequest, UpdateCommentRequest } from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private readonly http: HttpClient) {}

  getComments(taskId?: number): Observable<CommentItem[]> {
    const params = taskId ? new HttpParams().set('taskId', taskId) : undefined;
    return this.http.get<CommentItem[]>(`${API_BASE_URL}/comments`, { params });
  }

  createComment(request: CreateCommentRequest): Observable<CommentItem> {
    return this.http.post<CommentItem>(`${API_BASE_URL}/comments`, request);
  }

  updateComment(id: number, request: UpdateCommentRequest): Observable<CommentItem> {
    return this.http.put<CommentItem>(`${API_BASE_URL}/comments/${id}`, request);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/comments/${id}`);
  }
}
