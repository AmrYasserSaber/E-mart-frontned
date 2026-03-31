import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
import { appIcons } from '../../icons/font-awesome-icons';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AsyncPipe, FontAwesomeModule],
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
  readonly searchIcon = appIcons['search'];
  readonly cartIcon = appIcons['cart'];
  readonly notificationsIcon = appIcons['notifications'];
  readonly accountIcon = appIcons['account'];

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
