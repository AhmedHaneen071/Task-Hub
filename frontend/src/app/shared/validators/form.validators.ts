import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function trimmedRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (typeof value !== 'string') {
    return value === null || value === undefined ? { required: true } : null;
  }

  return value.trim().length === 0 ? { required: true } : null;
}

export function trimmedMinLength(requiredLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = stringValue(control.value);
    if (value.length === 0) {
      return null;
    }

    return value.length < requiredLength
      ? { minlength: { requiredLength, actualLength: value.length } }
      : null;
  };
}

export function trimmedMaxLength(requiredLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = stringValue(control.value);
    return value.length > requiredLength
      ? { maxlength: { requiredLength, actualLength: value.length } }
      : null;
  };
}

export function trimmedEmail(control: AbstractControl): ValidationErrors | null {
  const value = stringValue(control.value);
  if (value.length === 0) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : { email: true };
}

export function optionalUrl(control: AbstractControl): ValidationErrors | null {
  const value = stringValue(control.value);
  if (value.length === 0) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
  } catch {
    return { url: true };
  }
}

export function matchingFields(
  sourceControlName: string,
  confirmationControlName: string,
  errorKey = 'mismatch'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const source = control.get(sourceControlName);
    const confirmation = control.get(confirmationControlName);
    if (!source || !confirmation || stringValue(confirmation.value).length === 0) {
      return null;
    }

    return source.value === confirmation.value ? null : { [errorKey]: true };
  };
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
