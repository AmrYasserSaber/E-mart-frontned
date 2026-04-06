import { createReducer, on } from '@ngrx/store';
import type { User } from '../../../core/models/user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.hydrateFromStorage, (state, { accessToken, refreshToken, user }) => ({
    ...state,
    accessToken,
    refreshToken,
    user,
  })),
  on(AuthActions.login, AuthActions.register, AuthActions.exchangeOAuthCode, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    AuthActions.loginSuccess,
    AuthActions.exchangeOAuthCodeSuccess,
    (state, { accessToken, refreshToken }) => ({
      ...state,
      accessToken,
      refreshToken,
      loading: false,
      error: null,
    }),
  ),
  on(AuthActions.registerSuccess, (state, { accessToken, refreshToken, user }) => ({
    ...state,
    accessToken,
    refreshToken,
    user,
    loading: false,
    error: null,
  })),
  on(
    AuthActions.loginFailure,
    AuthActions.registerFailure,
    AuthActions.exchangeOAuthCodeFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    }),
  ),
  on(AuthActions.loadUser, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(AuthActions.loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logout, (state) => ({ ...state, loading: true })),
  on(AuthActions.logoutSuccess, () => ({ ...initialAuthState })),
  on(AuthActions.clearAuthError, (state) => ({ ...state, error: null })),
);
