import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Role } from '../../../core/models/user.model';
import { AuthActions } from '../../store/auth/auth.actions';
import {
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
} from '../../store/auth/auth.selectors';
import { selectCartCount } from '../../store/cart/cart.selectors';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly store = inject(Store);

  readonly user$ = this.store.select(selectUser);
  readonly isAuth$ = this.store.select(selectIsAuthenticated);
  readonly cartCount$ = this.store.select(selectCartCount);
  readonly showAdmin$ = this.store
    .select(selectUserRole)
    .pipe(map((r) => r === Role.ADMIN));

  readonly Role = Role;
  readonly mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
