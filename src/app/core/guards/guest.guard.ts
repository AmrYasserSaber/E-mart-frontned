import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../../shared/store/auth/auth.selectors';
import { sanitizeReturnUrl } from '../utils/url.utils';

export const guestGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const returnUrl = sanitizeReturnUrl(route.queryParamMap.get('returnUrl'));
  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((ok) => (ok ? router.createUrlTree([returnUrl]) : true)),
  );
};
