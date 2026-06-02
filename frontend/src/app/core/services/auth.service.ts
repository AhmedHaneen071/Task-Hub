import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { AuthResponse, LoginRequest, SignupRequest, UserSummary } from '../models/auth.models';
import { ApiErrorService } from './api-error.service';

interface StoredSession {
  token: string;
  user: UserSummary;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'taskhub.session';
  private readonly userSubject = new BehaviorSubject<UserSummary | null>(this.readSession()?.user ?? null);

  readonly currentUser$ = this.userSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly apiErrors: ApiErrorService
  ) {}

  get token(): string | null {
    return this.readSession()?.token ?? null;
  }

  get currentUserValue(): UserSummary | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.apiErrors.withHandling(
      this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
        tap((response) => this.saveSession(response))
      ),
      'Unable to sign in. Check your credentials and try again.'
    );
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.apiErrors.withHandling(
      this.http.post<AuthResponse>(`${API_BASE_URL}/auth/signup`, request).pipe(
        tap((response) => this.saveSession(response))
      ),
      'Unable to create your account. Review the fields and try again.'
    );
  }

  refreshMe(): Observable<UserSummary> {
    return this.apiErrors.withHandling(
      this.http.get<UserSummary>(`${API_BASE_URL}/auth/me`).pipe(
        tap((user) => {
          const token = this.token;
          if (token) {
            this.saveSession({ token, user });
          }
        })
      ),
      'Unable to refresh your session. Please sign in again.'
    );
  }

  logout(): void {
    try {
      if (this.canUseStorage()) {
        localStorage.removeItem(this.storageKey);
      }
    } catch {
      // Storage can be unavailable in restricted browser modes.
    }
    this.userSubject.next(null);
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'Admin';
  }

  private saveSession(session: StoredSession): void {
    try {
      if (this.canUseStorage()) {
        localStorage.setItem(this.storageKey, JSON.stringify(session));
      }
    } catch {
      // Keep the in-memory session even when persistent storage is blocked.
    }
    this.userSubject.next(session.user);
  }

  private readSession(): StoredSession | null {
    if (!this.canUseStorage()) {
      return null;
    }

    let raw: string | null = null;
    try {
      raw = localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      try {
        localStorage.removeItem(this.storageKey);
      } catch {
        return null;
      }
      return null;
    }
  }

  private canUseStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
