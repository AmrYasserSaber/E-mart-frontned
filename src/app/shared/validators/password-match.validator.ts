import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
  passwordKey: string,
  confirmKey: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (pass === confirm) return null;
    return { passwordMismatch: true };
  };
}
