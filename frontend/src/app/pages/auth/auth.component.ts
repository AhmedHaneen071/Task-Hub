import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../core/api.config';
import { AuthService } from '../../core/services/auth.service';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  mode: AuthMode = 'login';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.mode = data['mode'] === 'signup' ? 'signup' : 'login';
      const fullNameControl = this.form.controls.fullName;
      if (this.mode === 'signup') {
        fullNameControl.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        fullNameControl.clearValidators();
      }
      fullNameControl.updateValueAndValidity();
      this.errorMessage = '';
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const value = this.form.getRawValue();
    const request$ = this.mode === 'signup'
      ? this.auth.signup({
          fullName: value.fullName.trim(),
          email: value.email.trim(),
          password: value.password
        })
      : this.auth.login({
          email: value.email.trim(),
          password: value.password
        });

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.extractError(error);
      }
    });
  }

  private extractError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The API server is not reachable. Please ensure the backend is running at ' + API_BASE_URL + '. If using HTTPS, you may also need to trust the development certificate in your browser.';
    }
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return 'Unable to complete authentication. Check the API server logs and try again.';
  }
}
