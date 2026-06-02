import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidationMessageService {
  controlError(control: AbstractControl | null, label: string): string {
    if (!control || (!control.touched && !control.dirty) || !control.errors) {
      return '';
    }

    return this.errorText(control.errors, label);
  }

  private errorText(errors: ValidationErrors, label: string): string {
    if (errors['required']) {
      return `${label} is required.`;
    }

    if (errors['email']) {
      return 'Enter a valid email address.';
    }

    const minLength = errors['minlength'] as { requiredLength?: number } | undefined;
    if (minLength?.requiredLength) {
      return `${label} must be at least ${minLength.requiredLength} characters.`;
    }

    const maxLength = errors['maxlength'] as { requiredLength?: number } | undefined;
    if (maxLength?.requiredLength) {
      return `${label} must be ${maxLength.requiredLength} characters or fewer.`;
    }

    const min = errors['min'] as { min?: number } | undefined;
    if (min?.min) {
      return `${label} is required.`;
    }

    if (errors['url']) {
      return `${label} must be a valid URL.`;
    }

    if (errors['pattern']) {
      return `${label} format is invalid.`;
    }

    return `${label} is invalid.`;
  }
}
