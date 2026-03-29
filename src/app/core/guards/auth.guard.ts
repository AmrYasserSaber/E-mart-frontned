import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAuthenticated } from '../../shared/store/auth/auth.selectors';
import { sanitizeReturnUrl } from '../utils/url.utils';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectIsAuthenticated).pipe(
    take(1),
    map((ok) =>
      ok
        ? true
        : router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: sanitizeReturnUrl(state.url) },
          }),
    ),
  );
};
