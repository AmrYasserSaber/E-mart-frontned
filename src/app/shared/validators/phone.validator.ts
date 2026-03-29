import type { AbstractControl, ValidationErrors } from '@angular/forms';

/** Basic international-ish phone pattern */
const PHONE =
  /^\+?[1-9]\d{7,14}$/;

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value as string)?.replace(/[\s\-()]/g, '') ?? '';
  if (!v) return null;
  return PHONE.test(v) ? null : { phone: true };
}
