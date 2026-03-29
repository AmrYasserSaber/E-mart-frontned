import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { Role } from '../models/user.model';
import { selectUserRole } from '../../shared/store/auth/auth.selectors';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const roles = route.data['roles'] as Role[] | undefined;
  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (!role) return router.createUrlTree(['/auth/login']);
      if (!roles?.length) return true;
      return roles.includes(role) ? true : router.createUrlTree(['/home']);
    }),
  );
};
