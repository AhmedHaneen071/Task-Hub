import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { AuthResponse, LoginRequest, SignupRequest, UserSummary } from '../models/auth.models';

interface StoredSession {
  token: string;
  user: UserSummary;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'taskhub.session';
  private readonly userSubject = new BehaviorSubject<UserSummary | null>(this.readSession()?.user ?? null);

  readonly currentUser$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return this.readSession()?.token ?? null;
  }

  get currentUserValue(): UserSummary | null {
    return this.userSubject.value;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/signup`, request).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  refreshMe(): Observable<UserSummary> {
    return this.http.get<UserSummary>(`${API_BASE_URL}/auth/me`).pipe(
      tap((user) => {
        const token = this.token;
        if (token) {
          this.saveSession({ token, user });
        }
      })
    );
  }

  logout(): void {
    if (this.canUseStorage()) {
      localStorage.removeItem(this.storageKey);
    }
    this.userSubject.next(null);
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'Admin';
  }

  private saveSession(session: StoredSession): void {
    if (this.canUseStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
    this.userSubject.next(session.user);
  }

  private readSession(): StoredSession | null {
    if (!this.canUseStorage()) {
      return null;
    }

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private canUseStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
