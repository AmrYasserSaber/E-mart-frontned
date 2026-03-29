import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AuthActions } from '../../../shared/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../shared/store/auth/auth.selectors';
import { loginBodySchema } from '../../../core/validation/auth.schemas';
import { mapZodIssuesToFieldErrors } from '../../../core/validation/auth-error.utils';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  readonly loading$ = this.store.select(selectAuthLoading);
  readonly error$ = this.store.select(selectAuthError);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.store.dispatch(AuthActions.clearAuthError());
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.store) {
        this.store.dispatch(AuthActions.clearAuthError());
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const result = loginBodySchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors = mapZodIssuesToFieldErrors(result.error);
      const emailErr = fieldErrors['email'];
      const passwordErr = fieldErrors['password'];
      if (emailErr) this.form.controls.email.setErrors({ server: emailErr });
      if (passwordErr) this.form.controls.password.setErrors({ server: passwordErr });
      return;
    }
    this.store.dispatch(AuthActions.login(result.data));
  }

  get emailError(): string | null {
    const ctrl = this.form.controls.email;
    if (!ctrl.touched || ctrl.valid) return null;
    if (ctrl.errors?.['required']) return 'Email is required.';
    if (ctrl.errors?.['email']) return 'Please enter a valid email address.';
    if (ctrl.errors?.['server']) return ctrl.errors['server'] as string;
    return null;
  }

  get passwordError(): string | null {
    const ctrl = this.form.controls.password;
    if (!ctrl.touched || ctrl.valid) return null;
    if (ctrl.errors?.['required']) return 'Password is required.';
    if (ctrl.errors?.['minlength']) return 'Password must be at least 8 characters.';
    if (ctrl.errors?.['server']) return ctrl.errors['server'] as string;
    return null;
  }
}
