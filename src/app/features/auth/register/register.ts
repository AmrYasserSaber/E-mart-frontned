import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../shared/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../shared/store/auth/auth.selectors';
import { registerBodySchema } from '../../../core/validation/auth.schemas';
import { mapZodIssuesToMessage } from '../../../core/validation/auth-error.utils';
import { appIcons } from '../../../shared/icons/font-awesome-icons';

@Component({
  selector: 'app-register',
  imports: [AsyncPipe, FormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly store = inject(Store);
  readonly loading$ = this.store.select(selectAuthLoading);
  readonly error$ = this.store.select(selectAuthError);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  formError = '';
  readonly ecoIcon = appIcons['eco'];

  submit(): void {
    this.formError = '';
    this.store.dispatch(AuthActions.clearAuthError());

    if (this.password !== this.confirmPassword) {
      this.formError = 'Passwords do not match.';
      return;
    }

    const result = registerBodySchema.safeParse({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
    });

    if (!result.success) {
      this.formError = mapZodIssuesToMessage(result.error);
      return;
    }

    this.store.dispatch(AuthActions.register(result.data));
  }
}
