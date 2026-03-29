import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, (s) => s.user);

export const selectAccessToken = createSelector(
  selectAuthState,
  (s) => s.accessToken,
);

export const selectIsAuthenticated = createSelector(
  selectAccessToken,
  (token) => !!token,
);

export const selectUserRole = createSelector(selectUser, (u) => u?.role ?? null);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (s) => s.loading,
);

export const selectAuthError = createSelector(selectAuthState, (s) => s.error);
