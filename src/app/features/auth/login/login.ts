import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../shared/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../shared/store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly store = inject(Store);

  readonly loading$ = this.store.select(selectAuthLoading);
  readonly error$ = this.store.select(selectAuthError);

  email = '';
  password = '';

  submit(): void {
    if (!this.email.trim() || !this.password) return;
    this.store.dispatch(
      AuthActions.login({
        email: this.email.trim(),
        password: this.password,
      }),
    );
  }
}
