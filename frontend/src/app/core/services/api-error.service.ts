import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';

const API_REQUEST_TIMEOUT_MS = 15000;

interface ValidationProblemDetails {
  errors?: Record<string, string[]>;
  detail?: string;
  message?: string;
  title?: string;
}

export class AppApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly originalError: unknown
  ) {
    super(message);
    this.name = 'AppApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  withHandling<T>(request$: Observable<T>, fallback: string): Observable<T> {
    return request$.pipe(
      timeout(API_REQUEST_TIMEOUT_MS),
      catchError((error: unknown) => this.handle(error, fallback))
    );
  }

  handle(error: unknown, fallback: string): Observable<never> {
    const status = error instanceof HttpErrorResponse ? error.status : null;
    return throwError(() => new AppApiError(this.toMessage(error, fallback), status, error));
  }

  toMessage(error: unknown, fallback: string): string {
    if (error instanceof AppApiError) {
      return error.message;
    }

    if (error instanceof TimeoutError) {
      return 'The request timed out. Check your connection and try again.';
    }

    if (error instanceof HttpErrorResponse) {
      return this.fromHttpError(error, fallback);
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }

  private fromHttpError(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 0) {
      return 'The API server is not reachable. Confirm the backend is running and try again.';
    }

    const problem = this.asProblem(error.error);
    const validationMessage = this.validationMessage(problem);
    if (validationMessage) {
      return validationMessage;
    }

    if (problem?.message) {
      return problem.message;
    }

    if (problem?.detail) {
      return problem.detail;
    }

    switch (error.status) {
      case 400:
        return problem?.title ?? 'The request could not be processed. Review the highlighted fields.';
      case 401:
        return 'Invalid credentials or expired session. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested record could not be found.';
      case 408:
      case 504:
        return 'The request timed out. Check your connection and try again.';
      case 409:
        return problem?.title ?? 'A record with these details already exists.';
      default:
        return problem?.title ?? fallback;
    }
  }

  private asProblem(value: unknown): ValidationProblemDetails | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    return {
      errors: this.asValidationErrors(record['errors']),
      detail: typeof record['detail'] === 'string' ? record['detail'] : undefined,
      message: typeof record['message'] === 'string' ? record['message'] : undefined,
      title: typeof record['title'] === 'string' ? record['title'] : undefined
    };
  }

  private asValidationErrors(value: unknown): Record<string, string[]> | undefined {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const result: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(value as Record<string, unknown>)) {
      if (Array.isArray(messages)) {
        result[field] = messages.filter((message): message is string => typeof message === 'string');
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private validationMessage(problem: ValidationProblemDetails | null): string {
    if (!problem?.errors) {
      return '';
    }

    const messages = Object.values(problem.errors).flat().filter(Boolean);
    return messages.length > 0 ? messages.join(' ') : '';
  }
}
