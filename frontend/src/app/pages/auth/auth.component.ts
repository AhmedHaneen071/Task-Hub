import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
import { ValidationMessageService } from '../../core/services/validation-message.service';
import {
  matchingFields,
  trimmedEmail,
  trimmedMaxLength,
  trimmedMinLength,
  trimmedRequired
} from '../../shared/validators/form.validators';

type AuthMode = 'login' | 'signup';
type AuthControlName = 'fullName' | 'email' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group(
    {
      fullName: [''],
      email: ['', [trimmedRequired, trimmedEmail, trimmedMaxLength(180)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmPassword: ['']
    },
    { validators: [matchingFields('password', 'confirmPassword', 'passwordMismatch')] }
  );

  mode: AuthMode = 'login';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly apiErrors: ApiErrorService,
    private readonly validationMessages: ValidationMessageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.mode = data['mode'] === 'signup' ? 'signup' : 'login';
      const fullNameControl = this.form.controls.fullName;
      const confirmPasswordControl = this.form.controls.confirmPassword;
      if (this.mode === 'signup') {
        fullNameControl.setValidators([trimmedRequired, trimmedMinLength(2), trimmedMaxLength(120)]);
        confirmPasswordControl.setValidators([Validators.required]);
      } else {
        fullNameControl.clearValidators();
        confirmPasswordControl.clearValidators();
      }
      fullNameControl.updateValueAndValidity({ emitEvent: false });
      confirmPasswordControl.updateValueAndValidity({ emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
      this.form.reset({ fullName: '', email: '', password: '', confirmPassword: '' });
      this.errorMessage = '';
    });
  }

  submit(): void {
    try {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      if (this.form.invalid || this.loading) {
        this.errorMessage = 'Please correct the highlighted fields before continuing.';
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
          this.loading = false;
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: unknown) => {
          this.loading = false;
          this.errorMessage = this.apiErrors.toMessage(error, 'Unable to complete authentication.');
        }
      });
    } catch (error: unknown) {
      this.loading = false;
      this.errorMessage = this.apiErrors.toMessage(error, 'Unable to complete authentication.');
    }
  }

  fieldError(controlName: AuthControlName, label: string): string {
    return this.validationMessages.controlError(this.form.controls[controlName], label);
  }

  confirmPasswordError(): string {
    const controlError = this.fieldError('confirmPassword', 'Confirm password');
    if (controlError) {
      return controlError;
    }

    const control = this.form.controls.confirmPassword;
    if ((control.touched || control.dirty) && this.form.errors?.['passwordMismatch']) {
      return 'Passwords must match.';
    }

    return '';
  }

  hasFieldError(controlName: AuthControlName): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  hasConfirmPasswordError(): boolean {
    const control = this.form.controls.confirmPassword;
    return this.hasFieldError('confirmPassword') ||
      ((control.touched || control.dirty) && !!this.form.errors?.['passwordMismatch']);
  }
}
